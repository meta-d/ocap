import { Document } from '@langchain/core/documents'
import type { EmbeddingsInterface } from '@langchain/core/embeddings'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RedisVectorStore, RedisVectorStoreConfig } from '@langchain/redis'
import { AiProvider, ISemanticModel } from '@metad/contracts'
import { EntityType, getEntityHierarchy, getEntityProperty, isEntityType } from '@metad/ocap-core'
import { CopilotService, REDIS_CLIENT, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { InjectQueue } from '@nestjs/bull'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Queue } from 'bull'
import { RedisClientType } from 'redis'
import { firstValueFrom } from 'rxjs'
import { DeepPartial, FindConditions, FindManyOptions, In, Repository } from 'typeorm'
import { SemanticModel } from '../model/model.entity'
import { NgmDSCoreService, getSemanticModelKey } from '../model/ocap'
import { SemanticModelMember } from './member.entity'

@Injectable()
export class SemanticModelMemberService extends TenantOrganizationAwareCrudService<SemanticModelMember> {
	private readonly logger = new Logger(SemanticModelMemberService.name)

	private readonly vectorStores = new Map<string, PGRedisVectorStore>()

	constructor(
		@InjectRepository(SemanticModelMember)
		modelCacheRepository: Repository<SemanticModelMember>,

		@InjectRepository(SemanticModel)
		private modelRepository: Repository<SemanticModel>,

		private copilotService: CopilotService,

		@Inject(REDIS_CLIENT)
		private readonly redisClient: RedisClientType,

		@InjectQueue('member')
		private readonly memberQueue: Queue,

		private readonly dsCoreService: NgmDSCoreService
	) {
		super(modelCacheRepository)
	}

	async syncMembers(modelId: string, body: Record<string, {entityId: string; hierarchies: string[]}>) {
		const model = await this.modelRepository.findOne(modelId, { relations: ['dataSource', 'dataSource.type', 'roles'] })
		const modelKey = getSemanticModelKey(model)
		const modelDataSource = await firstValueFrom(this.dsCoreService.getDataSource(modelKey))

		for(const cube of Object.keys(body)) {
			const {hierarchies, entityId} = body[cube]

			this.logger.debug(`Sync members for dimensions: ${hierarchies} in cube: ${cube} of model: ${modelId} ...`)

			const entityType = await firstValueFrom(modelDataSource.selectEntityType(cube))
			if (!isEntityType(entityType)) {
				throw entityType
			}

			this.logger.debug(`Got entity type: ${entityType.name}`)

			let members = []
			for(const hierarchy of hierarchies) {
				const hierarchyProperty = getEntityHierarchy(entityType, hierarchy)
				const _members = await firstValueFrom(modelDataSource.selectMembers(cube, {dimension: hierarchyProperty.dimension, hierarchy: hierarchyProperty.name}))
				
				members = members.concat(_members.map((item) => ({...item,
					modelId,
					entityId,
					cube
				})))
			}

			this.logger.debug(`Got entity members: ${members.length}`)

			if (members.length) {
				await this.storeMembers(model, members, entityType)
			}
		}
	}

	async storeMembers(model: SemanticModel, members: DeepPartial<SemanticModelMember[]>, entityType: EntityType) {
		const vectorStore = await this.getVectorStore(model.id, entityType.name, model.organizationId)
		if (vectorStore) {
			await vectorStore.clear()
			return await vectorStore.storeMembers(members, entityType)
		} else {
			this.bulkCreate(model.id, members)
		}
	}

	async bulkCreate(modelId: string, members: DeepPartial<SemanticModelMember[]>) {
		// Remove previous members
		try {
			await this.bulkDelete(modelId, {})
		} catch (err) {}

		members = members.map((member) => ({
			...member,
			modelId
		}))
		return await Promise.all(members.map((member) => this.create(member)))
	}

	async bulkDelete(id: string, query: FindManyOptions<SemanticModelMember>) {
		query = query ?? {}
		const { items: members } = await this.findAll({
			...query,
			where: {
				...((query.where as FindConditions<SemanticModelMember>) ?? {}),
				modelId: id
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
		if (copilot && copilot.enabled && [AiProvider.OpenAI, AiProvider.Azure].includes(copilot.provider)) {
			const id = modelId ? `${modelId}${cube ? ':' + cube : ''}` : 'default'
			if (!this.vectorStores.has(id)) {
				const embeddings = new OpenAIEmbeddings({
					verbose: true,
					apiKey: copilot.apiKey,
					configuration: {
						baseURL: copilot.apiHost
					}
				})
				this.vectorStores.set(
					id,
					new PGRedisVectorStore(this, modelId, embeddings, {
						redisClient: this.redisClient,
						indexName: `dm:${id}`
					})
				)
			}

			return this.vectorStores.get(id)
		}

		return null
	}

	async seedVectorStore(models: ISemanticModel[]) {
		for (const model of models) {
			this.memberQueue.add('seedVectorStore', { modelId: model.id, organizationId: model.organizationId })
		}
	}
}

class PGRedisVectorStore {
	vectorStore: RedisVectorStore
	constructor(
		private memberService: SemanticModelMemberService,
		private modelId: string,
		private embeddings: EmbeddingsInterface,
		private _dbConfig: RedisVectorStoreConfig
	) {
		this.vectorStore = new RedisVectorStore(embeddings, _dbConfig)
	}

	async checkIndexExists() {
		return this.vectorStore.checkIndexExists()
	}

	async storeMembers(members: DeepPartial<SemanticModelMember>[], entityType: EntityType) {
		members = members.map((member) => {
			const dimensionProperty = getEntityProperty(entityType, member.dimension)
			const hierarchyProperty = getEntityHierarchy(entityType, member.hierarchy)
			return {
				...member,
				content: `dimension (name: '${member.dimension}', caption: '${dimensionProperty.caption}') hierarchy (name: '${member.hierarchy}', caption: '${hierarchyProperty.caption}') member (key: '${member.memberKey}', caption: '${member.memberCaption}')`
			}
		})

		const texts = members.map(({ content }) => content)
		const vectors = await this.embeddings.embedDocuments(texts)

		const _members = await this.memberService.bulkCreate(
			this.modelId,
			members.map((member, index) => ({
				...member,
				vector: vectors[index]
			}))
		)

		return this.addMembers(_members)
	}

	async addMembers(members: SemanticModelMember[]) {
		if (!members.length) return
		
		const vectors = members.map((member) => member.vector)
		const documents = members.map(
			(member) =>
				new Document({
					metadata: {
						key: member.memberKey,
						dimension: member.dimension,
						hierarchy: member.hierarchy,
						member: member.memberName
					},
					pageContent: member.content
				})
		)

		return this.vectorStore.addVectors(vectors, documents)
	}

	async clear() {
		return await this.vectorStore.delete({ deleteAll: true })
	}
}
