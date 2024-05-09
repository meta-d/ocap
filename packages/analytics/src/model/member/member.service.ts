import { Document } from '@langchain/core/documents'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RedisVectorStore } from '@langchain/redis'
import { AiProvider, CopilotService, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RedisClientType } from 'redis'
import { DeepPartial, FindConditions, FindManyOptions, In, Repository } from 'typeorm'
import { REDIS_CLIENT } from '../../core'
import { SemanticModelService } from '../model.service'
import { SemanticModelMember } from './member.entity'

@Injectable()
export class SemanticModelMemberService extends TenantOrganizationAwareCrudService<SemanticModelMember> {
	private readonly vectorStores = new Map<string, RedisVectorStore>()

	constructor(
		@InjectRepository(SemanticModelMember)
		modelCacheRepository: Repository<SemanticModelMember>,

		private modelsService: SemanticModelService,
		private copilotService: CopilotService,

		@Inject(REDIS_CLIENT)
		private readonly redisClient: RedisClientType
	) {
		super(modelCacheRepository)
	}

	async bulkCreate(id: string, members: DeepPartial<SemanticModelMember[]>) {
		const model = await this.modelsService.findOne(id)
		const _members = await Promise.all(
			members.map((member) => {
				return this.create({
					...member,
					modelId: model.id
				})
			})
		)

		const vectorStore = await this.getVectorStore(model.id, members[0].entity)
		if (vectorStore) {
			await vectorStore.addDocuments(
				_members.slice(0, 10).map(
					(member) =>
						new Document({
							metadata: { key: member.memberKey },
							pageContent: `dimension: '${member.dimension}' hierarchy: '${member.hierarchy}' member key: ${member.memberKey}; caption: ${member.memberCaption}`
						})
				)
			)
		}
		return _members
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
		const vectorStore = await this.getVectorStore(id, cube)
		if (vectorStore) {
			const documents = await vectorStore.similaritySearch(query, k)
			return documents
		}

		return null
	}

	async getVectorStore(id: string, cube: string) {
		const result = await this.copilotService.findAll()
		const copilot = result.items[0]
		if (copilot && [AiProvider.OpenAI, AiProvider.Azure].includes(copilot.provider)) {
			id = id ? `${id}${cube ? ':' + cube : ''}` : 'default'
			if (!this.vectorStores.has(id)) {
				this.vectorStores.set(
					id,
					new RedisVectorStore(
						new OpenAIEmbeddings({
							verbose: true,
							apiKey: copilot.apiKey,
							configuration: {
								baseURL: copilot.apiHost
							}
						}),
						{
							redisClient: this.redisClient,
							indexName: `dm:m-${id}`
						}
					)
				)
			}

			const vectorStore = this.vectorStores.get(id)

			return vectorStore
		}

		return null
	}
}
