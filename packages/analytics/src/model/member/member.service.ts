import { Document } from '@langchain/core/documents'
import type { EmbeddingsInterface } from '@langchain/core/embeddings'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RedisVectorStore, RedisVectorStoreConfig } from '@langchain/redis'
import { ISemanticModel } from '@metad/contracts'
import { EntityType, getEntityHierarchy, getEntityProperty } from '@metad/ocap-core'
import { AiProvider, CopilotService, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { groupBy } from 'lodash'
import { RedisClientType } from 'redis'
import { DeepPartial, FindConditions, FindManyOptions, In, Repository } from 'typeorm'
import { REDIS_CLIENT } from '../../core'
import { SemanticModel } from '../model.entity'
import { SemanticModelMember } from './member.entity'

@Injectable()
export class SemanticModelMemberService extends TenantOrganizationAwareCrudService<SemanticModelMember> {
	private readonly vectorStores = new Map<string, PGRedisVectorStore>()

	constructor(
		@InjectRepository(SemanticModelMember)
		modelCacheRepository: Repository<SemanticModelMember>,

		@InjectRepository(SemanticModel)
		private modelRepository: Repository<SemanticModel>,

		private copilotService: CopilotService,

		@Inject(REDIS_CLIENT)
		private readonly redisClient: RedisClientType
	) {
		super(modelCacheRepository)
	}

	async storeMembers(modelId: string, members: DeepPartial<SemanticModelMember[]>, entityType: EntityType) {
		const model = await this.modelRepository.findOne(modelId)
		if (!model) {
			return
		}

		const vectorStore = await this.getVectorStore(model.id, entityType.name)
		if (vectorStore) {
			await vectorStore.clear()
			return await vectorStore.storeMembers(members, entityType)
		} else {
			this.bulkCreate(modelId, members)
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
			const documents = await vectorStore.similaritySearch(query, k)
			return documents
		}

		return null
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
			const { items: members } = await this.findAll({ where: { modelId: model.id } })
			const cubes = groupBy(members, 'entity')
			for (const [cube, items] of Object.entries<any>(cubes)) {
				const vectorStore = await this.getVectorStore(model.id, cube, model.organizationId)
				if (vectorStore) {
					await vectorStore.addMembers(items.filter((member) => member.vector))
				}
			}
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
