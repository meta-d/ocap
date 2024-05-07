import { AiProvider, CopilotService, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindConditions, FindManyOptions, In, Repository } from 'typeorm'
import { SemanticModelMember } from './member.entity'
import { SemanticModelService } from '../model.service'
import { REDIS_CLIENT } from '../../core'
import { RedisClientType } from 'redis'
import { RedisVectorStore } from "@langchain/redis";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";



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

		const result = await this.copilotService.findAll()
		const copilot = result.items[0]
		if (copilot && copilot.provider === AiProvider.OpenAI) {
			console.log(copilot)
			if (!this.vectorStores.has(model.id)) {
				this.vectorStores.set(model.id, new RedisVectorStore(new OpenAIEmbeddings({
					verbose: true,
					apiKey: copilot.apiKey,
					configuration: {
						baseURL: copilot.apiHost
					}
				}), {
					redisClient: this.redisClient,
					indexName: `dimension-member:ds-${model.id}:cube-${members[0].entity}`,
				  }))
			}
	
			const vectorStore = this.vectorStores.get(model.id)
			
			await vectorStore.addDocuments(_members.slice(0, 10).map((member) => new Document({
				metadata: { key: member.memberUniqueName },
				pageContent: `dimension ${member.hierarchy} member key: ${member.memberUniqueName}; caption: ${member.memberCaption}`
			  })))
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
}
