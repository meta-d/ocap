import { PGVectorStore, PGVectorStoreArgs } from '@langchain/community/vectorstores/pgvector'
import { Document } from '@langchain/core/documents'
import type { EmbeddingsInterface } from '@langchain/core/embeddings'
import { OpenAIEmbeddings } from '@langchain/openai'
import { AIEmbeddings, ISemanticModel, ISemanticModelEntity } from '@metad/contracts'
import {
	EntityType,
	PropertyDimension,
	PropertyHierarchy,
	PropertyLevel,
	getEntityHierarchy,
	getEntityLevel,
	getEntityProperty,
	isEntityType
} from '@metad/ocap-core'
import { CopilotService, DATABASE_POOL_TOKEN, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Pool } from 'pg'
import { firstValueFrom } from 'rxjs'
import { DeepPartial, FindConditions, FindManyOptions, In, Repository } from 'typeorm'
import { SemanticModel } from '../model/model.entity'
import { NgmDSCoreService, getSemanticModelKey } from '../model/ocap'
import { SemanticModelMember } from './member.entity'

@Injectable()
export class SemanticModelMemberService extends TenantOrganizationAwareCrudService<SemanticModelMember> {
	private readonly logger = new Logger(SemanticModelMemberService.name)

	private readonly vectorStores = new Map<string, PGMemberVectorStore>()

	constructor(
		@InjectRepository(SemanticModelMember)
		modelCacheRepository: Repository<SemanticModelMember>,

		@InjectRepository(SemanticModel)
		private modelRepository: Repository<SemanticModel>,

		private copilotService: CopilotService,

		private readonly dsCoreService: NgmDSCoreService,

		@Inject(DATABASE_POOL_TOKEN) private pgPool: Pool
	) {
		super(modelCacheRepository)
	}

	/**
	 * Sync dimension members from model source into members table and vector store table
	 *
	 * @param modelId
	 * @param body Cube name and it's hierarchies
	 */
	async syncMembers(modelId: string, body: Record<string, { entityId: string; hierarchies: string[] }>, { createdById }: Partial<ISemanticModelEntity>) {
		const model = await this.modelRepository.findOne(modelId, {
			relations: ['dataSource', 'dataSource.type', 'roles']
		})
		const modelKey = getSemanticModelKey(model)
		const modelDataSource = await firstValueFrom(this.dsCoreService.getDataSource(modelKey))

		const cubeMembers = {}
		for (const cube of Object.keys(body)) {
			const { hierarchies, entityId } = body[cube]

			this.logger.debug(`Sync members for dimensions: ${hierarchies} in cube: ${cube} of model: ${modelId} ...`)

			const entityType = await firstValueFrom(modelDataSource.selectEntityType(cube))
			if (!isEntityType(entityType)) {
				throw entityType
			}

			this.logger.debug(`Got entity type: ${entityType.name}`)

			const hMembers = {}
			let members = []
			for (const hierarchy of hierarchies) {
				const hierarchyProperty = getEntityHierarchy(entityType, hierarchy)
				const _members = await firstValueFrom(
					modelDataSource.selectMembers(cube, {
						dimension: hierarchyProperty.dimension,
						hierarchy: hierarchyProperty.name
					})
				)

				hMembers[hierarchy] = _members.length
				members = members.concat(_members.map((item) => ({ ...item, modelId, entityId, cube })))
			}

			this.logger.debug(`Got entity members: ${members.length}`)

			if (members.length) {
				await this.storeMembers(model, cube, members.map((member) => ({...member, createdById })), entityType)
			}

			cubeMembers[cube] = hMembers
		}

		return cubeMembers
	}

	/**
	 * Store the members of specified dimension using Cube as the smallest unit.
	 */
	async storeMembers(model: SemanticModel, cube: string, members: DeepPartial<SemanticModelMember[]>, entityType: EntityType) {
		const entities = await this.bulkCreate(model, cube, members)
		const vectorStore = await this.getVectorStore(model.id, entityType.name, model.organizationId)
		if (vectorStore) {
			await vectorStore.clear()
			await vectorStore.addMembers(entities, entityType)
			await Promise.all(entities.map((entity) => this.update(entity.id, { vector: true })))
		}

		return entities
	}

	async bulkCreate(model: ISemanticModel, cube: string, members: DeepPartial<SemanticModelMember[]>) {
		// Remove previous members
		try {
			await this.bulkDelete(model.id, cube, {})
		} catch (err) {}

		members = members.map((member) => ({
			...member,
			tenantId: model.tenantId,
			organizationId: model.organizationId,
			modelId: model.id,
			cube
		}))

		return await Promise.all(members.map((member) => this.create(member)))
	}

	async bulkDelete(modelId: string, cube: string, query: FindManyOptions<SemanticModelMember>) {
		query = query ?? {}
		const { items: members } = await this.findAll({
			...query,
			where: {
				...((query.where as FindConditions<SemanticModelMember>) ?? {}),
				modelId,
				cube
			}
		})
		return await this.delete({ id: In(members.map((item) => item.id)) })
	}

	async retrieveMembers(id: string | null, cube: string, query: string, k = 10) {
		const { vectorStore } = await this.getVectorStore(id, cube)
		if (vectorStore) {
			try {
				return await vectorStore.similaritySearch(query, k)
			} catch (error) {
				return []
			}
		}

		return []
	}

	async getVectorStore(modelId: string, cube: string, organizationId: string = null) {
		const where = {}
		if (organizationId) {
			where['organizationId'] = organizationId
		}
		const result = await this.copilotService.findAll({ where })
		const copilot = result.items[0]
		if (copilot && copilot.enabled && AIEmbeddings.includes(copilot.provider)) {
			const id = modelId ? `${modelId}${cube ? ':' + cube : ''}` : 'default'
			if (!this.vectorStores.has(id)) {
				const embeddings = new OpenAIEmbeddings({
					verbose: true,
					apiKey: copilot.apiKey,
					configuration: {
						baseURL: copilot.apiHost
					}
				})

				const vectorStore = new PGMemberVectorStore(embeddings, {
					pool: this.pgPool,
					tableName: 'model_member_vector',
					collectionTableName: 'model_member_collection',
					collectionName: id,
					columns: {
						idColumnName: 'id',
						vectorColumnName: 'vector',
						contentColumnName: 'content',
						metadataColumnName: 'metadata'
					}
				})

				// Create table for vector store if not exist
				await vectorStore.ensureTableInDatabase()

				this.vectorStores.set(id, vectorStore)
			}

			return this.vectorStores.get(id)
		}

		return null
	}
}

class PGMemberVectorStore {
	vectorStore: PGVectorStore

	constructor(
		embeddings: EmbeddingsInterface,
		_dbConfig: PGVectorStoreArgs
	) {
		this.vectorStore = new PGVectorStore(embeddings, _dbConfig)
	}

	async addMembers(members: SemanticModelMember[], entityType: EntityType) {
		if (!members.length) return

		const documents = members.map(
			(member) => {
				const dimensionProperty = getEntityProperty(entityType, member.dimension)
				const hierarchyProperty = getEntityHierarchy(entityType, member.hierarchy)
				const levelProperty = getEntityLevel(entityType, member)

				return new Document({
					metadata: {
						id: member.id,
						key: member.memberKey,
						dimension: member.dimension,
						hierarchy: member.hierarchy,
						level: member.level,
						member: member.memberName
					},
					pageContent: formatMemberContent(member, dimensionProperty, hierarchyProperty, levelProperty)
				})
			}
				
		)

		return this.vectorStore.addDocuments(documents, {ids: members.map((member) => member.id)})
	}

	similaritySearch(query: string, k: number) {
		return this.vectorStore.similaritySearch(query, k)
	}

	async clear() {
		await this.vectorStore.delete({ filter: {} })
	}

	/**
	 * Create table for vector store if not exist
	 */
	async ensureTableInDatabase() {
		await this.vectorStore.ensureTableInDatabase()
		await this.vectorStore.ensureCollectionTableInDatabase()
	}
}

function formatMemberContent(
	member: DeepPartial<SemanticModelMember>,
	dimensionProperty: PropertyDimension,
	hierarchyProperty: PropertyHierarchy,
	levelProperty: PropertyLevel
) {
	return `dimension:
	name: '${member.dimension}'
	caption: '${dimensionProperty.caption || ''}'
hierarchy:
	name: '${member.hierarchy}'
	caption: '${hierarchyProperty.caption || ''}'
level:
	name: '${member.level}'
	caption: '${levelProperty?.caption || ''}'
member:
	key: '${member.memberKey}'
	caption: '${member.memberCaption || ''}'
`
}
