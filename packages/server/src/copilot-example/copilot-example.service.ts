import { MaxMarginalRelevanceSearchOptions } from '@langchain/core/vectorstores'
import { Document } from '@langchain/core/documents'
import type { EmbeddingsInterface } from '@langchain/core/embeddings'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RedisVectorStore, RedisVectorStoreConfig } from '@langchain/redis'
import { AiBusinessRole, AiProvider, ICopilotExample } from '@metad/contracts'
import { HttpException, Inject, Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { compact, uniq } from 'lodash'
import { RedisClientType } from 'redis'
import { DeleteResult, FindManyOptions, FindOneOptions, In, Repository, UpdateResult } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { CopilotService } from '../copilot/copilot.service'
import { RequestContext } from '../core'
import { TenantAwareCrudService } from '../core/crud'
import { REDIS_CLIENT } from '../core/redis.module'
import { TenantService } from '../tenant/tenant.service'
import { CopilotExampleVectorSeedCommand } from './commands'
import { CopilotExample } from './copilot-example.entity'
import { CopilotRoleCreateCommand } from '../copilot-role/commands/'

@Injectable()
export class CopilotExampleService extends TenantAwareCrudService<CopilotExample> {
	readonly #logger = new Logger(CopilotExampleService.name)

	private readonly vectorStores = new Map<string, PGRedisVectorStore>()

	constructor(
		@InjectRepository(CopilotExample)
		repository: Repository<CopilotExample>,

		private copilotService: CopilotService,
		private readonly tenantService: TenantService,

		@Inject(REDIS_CLIENT)
		private readonly redisClient: RedisClientType,

		private readonly commandBus: CommandBus
	) {
		super(repository)
	}

	async seedRedisIfEmpty() {
		const { items: tenants } = await this.tenantService.findAll()
		for (const tenant of tenants) {
			await this.commandBus.execute(new CopilotExampleVectorSeedCommand({ tenantId: tenant.id, refresh: true}))
		}
	}

	async similaritySearch(
		query: string,
		options?: { role?: AiBusinessRole; command: string; k: number; filter: string[]; score?: number }
	) {
		const { role, command, k, score, filter } = options ?? {}
		const commandFilter = `*\\\\"command\\\\"\\\\:\\\\"${command}\\\\"*`

		const tenantId = RequestContext.currentTenantId()
		let vectorStore = await this.getVectorStore(tenantId, role)
		if (vectorStore) {
			let results = []
			try {
				results = await vectorStore.vectorStore.similaritySearchWithScore(query, k, [commandFilter, ...(filter ?? [])])
			} catch (error) {
				results = []
			}

			// If no results found (index not exist for role or examples for command not exist in the role)
			// try to search in default examples
			if (!results.length) {
				if (role) {
					this.#logger.debug(
						`Examples does not exist for role: ${role} in indexName '${vectorStore.indexName}'. use examples in default instead`
					)
					vectorStore = await this.getVectorStore(tenantId)
					try {
						results = await vectorStore.vectorStore.similaritySearchWithScore(query, k, [commandFilter, ...(filter ?? [])])

						if (!results.length) {
							this.#logger.debug(
								`Search '${query}' examples for command '${command}' does not exist in default indexName '${vectorStore.indexName}'.`
							)
						}
					} catch (error) {
						this.#logger.error(error)
						results = []
					}
				}
			}

			return results.filter(([, _score]) => _score > (score ?? 0.2)).map(([doc]) => doc)
		}

		return []
	}

	async maxMarginalRelevanceSearch(
		query: string,
		options?: { role?: AiBusinessRole; command?: string; k: number; filter: string[] }
	) {
		const { role, command, k, filter } = options ?? {}
		const commandFilter = `*\\\\"command\\\\"\\\\:\\\\"${command}\\\\"*`

		const tenantId = RequestContext.currentTenantId()
		const vectorStore = await this.getVectorStore(tenantId, role)

		if (vectorStore) {
			return await vectorStore.vectorStore.maxMarginalRelevanceSearch(query, {
				...(options ?? {}),
				filter: [commandFilter, ...(filter ?? [])]
			} as MaxMarginalRelevanceSearchOptions<string[]>, undefined)
		}
		return null
	}

	override async create(partialEntity: Partial<ICopilotExample>, ...options: any[]): Promise<CopilotExample> {
		const entity = await this.tryEmbedExample(partialEntity as ICopilotExample)
		return super.create(entity, ...options)
	}

	override async update(
		id: string,
		partialEntity: QueryDeepPartialEntity<CopilotExample>,
		...options: any[]
	): Promise<UpdateResult | CopilotExample> {
		const tenantId = RequestContext.currentTenantId()
		let entity = partialEntity as ICopilotExample
		const vectorStore = await this.getVectorStore(tenantId, entity.role)
		if (vectorStore && !entity.vector) {
			const examples = await this.embedExamples([entity])
			entity = examples[0]
		}
		const result = await super.update(id, entity)

		// Update the vector store
		await this.commandBus.execute(new CopilotExampleVectorSeedCommand({ tenantId, refresh: true }))

		return result
	}

	private async tryEmbedExample(entity: ICopilotExample) {
		const tenantId = RequestContext.currentTenantId()
		const vectorStore = await this.getVectorStore(tenantId, entity.role)
		if (vectorStore && !entity.vector) {
			const examples = await this.embedExamples([entity])
			entity = examples[0]
		}
		if (vectorStore) {
			vectorStore.addExamples([entity])
		}
		return entity
	}

	private async getEmbeddings(tenantId: string, organizationId: string = null) {
		const where = {}
		if (tenantId) {
			where['tenantId'] = tenantId
		}
		if (organizationId) {
			where['organizationId'] = organizationId
		}
		const result = await this.copilotService.findAll({ where })
		const copilot = result.items[0]
		if (copilot && copilot.enabled && [AiProvider.OpenAI, AiProvider.Azure].includes(copilot.provider)) {
			const embeddings = new OpenAIEmbeddings({
				verbose: true,
				apiKey: copilot.apiKey,
				configuration: {
					baseURL: copilot.apiHost
				}
			})

			return embeddings
		}

		return null
	}

	private async embedExamples(examples: Partial<ICopilotExample>[]) {
		examples.forEach((example) => {
			example.content ??= example.input
			example.metadata = {
				role: example.role,
				command: example.command,
				input: example.input,
				output: example.output
			}
		})
		const texts = examples.map(({ content }) => content)

		const embeddings = await this.getEmbeddings(RequestContext.currentTenantId())
		if (embeddings) {
			try {
				const vectors = await embeddings.embedDocuments(texts)
				examples.forEach((example, index) => (example.vector = vectors[index]))
			} catch (error) {
				throw new HttpException(`Cannot embed examples: ${error.message}`, 500)
			}
		}

		return examples
	}

	async getVectorStore(
		tenantId: string,
		role?: AiBusinessRole | string,
		command: string = null,
		organizationId: string = null
	) {
		const id = tenantId + `:${role || 'default'}${command ? ':' + command : ''}`
		if (!this.vectorStores.has(id)) {
			const embeddings = await this.getEmbeddings(tenantId, organizationId)
			if (embeddings) {
				this.vectorStores.set(
					id,
					new PGRedisVectorStore(embeddings, {
						redisClient: this.redisClient,
						indexName: `copilot-examples:${id}`
					})
				)
				return this.vectorStores.get(id)
			}

			return null
		}

		return this.vectorStores.get(id)
	}

	override async delete(criteria: string, options?: FindOneOptions<CopilotExample>): Promise<DeleteResult> {
		const result = await super.delete(criteria, options)
		await this.commandBus.execute(
			new CopilotExampleVectorSeedCommand({ tenantId: RequestContext.currentTenantId(), refresh: true })
		)
		return result
	}

	async getCommands(options?: FindManyOptions<CopilotExample>) {
		return this.repository
			.createQueryBuilder('example')
			.select('example.command')
			.distinctOn(['example.command'])
			.where(options?.where)
			.getMany()
	}

	async createBulk(entities: ICopilotExample[], options: { createRole: boolean; clearRole: boolean }) {
		const { createRole, clearRole } = options || {}
		const examples = await this.embedExamples(entities)
		const roles = compact(uniq(examples.map((example) => example.role)))
		if (clearRole) {
			const { items } = await this.findAll({ where: { role: In(roles) } })
			await this.repository.remove(items)
		}
		if (createRole) {
			for await (const role of roles) {
				try {
					await this.commandBus.execute(new CopilotRoleCreateCommand({ name: role }))
				} catch (error) {}
			}
		}
		const results = await Promise.all(examples.map((entity) => super.create(entity)))
		await this.commandBus.execute(
			new CopilotExampleVectorSeedCommand({ tenantId: RequestContext.currentTenantId(), refresh: true })
		)
		return results
	}
}

class PGRedisVectorStore {
	vectorStore: RedisVectorStore

	get indexName() {
		return this.vectorStore.indexName
	}

	constructor(
		public embeddings: EmbeddingsInterface,
		private _dbConfig: RedisVectorStoreConfig
	) {
		this.vectorStore = new RedisVectorStore(embeddings, _dbConfig)
	}

	async checkIndexExists() {
		return this.vectorStore.checkIndexExists()
	}

	async addExamples(examples: ICopilotExample[]) {
		if (!examples.length) return

		const vectors = examples.map((item) => item.vector)
		const documents = examples.map(
			(item) =>
				new Document({
					metadata: item.metadata,
					pageContent: item.content
				})
		)
		// const keys = examples.map((item) => this.vectorStore.indexName + ':' + item.id)

		return await this.vectorStore.addVectors(vectors, documents)
	}

	async clear() {
		return await this.vectorStore.delete({ deleteAll: true })
	}
}