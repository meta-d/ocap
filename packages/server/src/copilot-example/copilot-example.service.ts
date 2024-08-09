import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama'
import { PGVectorStore, PGVectorStoreArgs } from '@langchain/community/vectorstores/pgvector'
import { Document } from '@langchain/core/documents'
import type { EmbeddingsInterface } from '@langchain/core/embeddings'
import { MaxMarginalRelevanceSearchOptions } from '@langchain/core/vectorstores'
import { OpenAIEmbeddings } from '@langchain/openai'
import {
	AiBusinessRole,
	AiProvider,
	AiProviderRole,
	ICopilot,
	ICopilotKnowledge,
	ICopilotRole,
	OllamaEmbeddingsProviders,
	OpenAIEmbeddingsProviders
} from '@metad/contracts'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { compact, uniq } from 'lodash'
import { Pool } from 'pg'
import { DeleteResult, FindManyOptions, FindOneOptions, Repository, UpdateResult } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { CopilotRoleCreateCommand } from '../copilot-role/commands/'
import { CopilotService } from '../copilot/copilot.service'
import { RequestContext } from '../core'
import { TenantOrganizationAwareCrudService } from '../core/crud'
import { DATABASE_POOL_TOKEN } from '../database'
import { CopilotKnowledge } from './copilot-example.entity'

@Injectable()
export class CopilotKnowledgeService extends TenantOrganizationAwareCrudService<CopilotKnowledge> {
	readonly #logger = new Logger(CopilotKnowledgeService.name)

	private readonly vectorStores = new Map<string, PGMemberVectorStore>()

	constructor(
		@InjectRepository(CopilotKnowledge)
		repository: Repository<CopilotKnowledge>,

		private copilotService: CopilotService,
		@Inject(DATABASE_POOL_TOKEN) private pgPool: Pool,

		private readonly commandBus: CommandBus
	) {
		super(repository)
	}

	async similaritySearch(
		query: string,
		options?: { role?: AiBusinessRole; command: string; k: number; filter: PGVectorStore['filter']; score?: number }
	) {
		const { role, command, k, score, filter } = options ?? {}

		let vectorStore = await this.getVectorStore(role)
		if (vectorStore) {
			let results = []
			try {
				results = await vectorStore.vectorStore.similaritySearchWithScore(query, k, {
					...(filter ?? {}),
					command
				})
			} catch (error) {
				results = []
			}

			// If no results found (index not exist for role or examples for command not exist in the role)
			// try to search in default examples
			if (!results.length) {
				if (role) {
					this.#logger.debug(
						`Examples does not exist for role: ${role} with command '${command}'. use examples in default instead`
					)
					vectorStore = await this.getVectorStore(null)
					try {
						results = await vectorStore.vectorStore.similaritySearchWithScore(query, k, {
							...(filter ?? {}),
							command
						})

						if (!results.length) {
							this.#logger.debug(
								`Search '${query}' examples for command '${command}' does not exist in default.`
							)
						}
					} catch (error) {
						this.#logger.error(error)
						results = []
					}
				}
			}

			return results.filter(([, _score]) => 1 - _score > (score ?? 0.7)).map(([doc]) => doc)
		}

		return []
	}

	async maxMarginalRelevanceSearch(
		query: string,
		options?: { role?: AiBusinessRole; command?: string; k: number; filter: Record<string, any> }
	) {
		const { role, command, k, filter } = options ?? {}

		const vectorStore = await this.getVectorStore(role)

		if (vectorStore) {
			return await vectorStore.vectorStore.maxMarginalRelevanceSearch(
				query,
				{
					...(options ?? {})
				} as MaxMarginalRelevanceSearchOptions<Record<string, any>>,
				undefined
			)
		}
		return null
	}

	override async create(partialEntity: Partial<ICopilotKnowledge>, ...options: any[]): Promise<CopilotKnowledge> {
		const entity = await super.create(partialEntity, ...options)

		// Update to vector store
		const vectorStore = await this.getVectorStore(entity.role)
		if (vectorStore) {
			await vectorStore.updateExamples([entity])
			super.update(entity.id, { provider: vectorStore.provider, vector: true })
		}

		return entity
	}

	override async update(
		id: string,
		partialEntity: QueryDeepPartialEntity<CopilotKnowledge>,
		...options: any[]
	): Promise<UpdateResult | CopilotKnowledge> {
		await super.update(id, partialEntity)
		const entity = await this.findOneByIdString(id)

		// Update to vector store
		const vectorStore = await this.getVectorStore(entity.role)
		if (vectorStore) {
			await vectorStore.updateExamples([entity])
			super.update(entity.id, { provider: vectorStore.provider, vector: true })
		}

		return entity
	}

	override async delete(criteria: string, options?: FindOneOptions<CopilotKnowledge>): Promise<DeleteResult> {
		const entity = await this.findOne(criteria, options)
		const result = await super.delete(criteria, options)

		// Delete example from vector store
		const vectorStore = await this.getVectorStore(entity.role)
		if (vectorStore) {
			await vectorStore.deleteExample(entity)
		}

		return result
	}

	/**
	 * Create embeddings for tenant and organization
	 *
	 * @param tenantId
	 * @param organizationId
	 * @returns
	 */
	private async getEmbeddings(copilot: ICopilot) {
		if (copilot) {
			if (OpenAIEmbeddingsProviders.includes(copilot.provider)) {
				return new OpenAIEmbeddings({
					verbose: true,
					apiKey: copilot.apiKey,
					configuration: {
						baseURL: copilot.apiHost
					}
				})
			} else if (OllamaEmbeddingsProviders.includes(copilot.provider)) {
				return new OllamaEmbeddings({
					baseUrl: copilot.apiHost,
					model: copilot.defaultModel
				})
			}
		}

		return null
	}

	async getVectorStore(
		role: AiBusinessRole | string,
		// command: string,
	) {
		const tenantId = RequestContext.currentTenantId()
		const organizationId = RequestContext.getOrganizationId()
		const id = (organizationId || tenantId) + `:${role || 'default'}` // ${command ? ':' + command : ''}`
		if (!this.vectorStores.has(id)) {
			let primaryCopilot = await this.copilotService.findOneByRole(AiProviderRole.Primary)
			if (!primaryCopilot?.enabled) {
				primaryCopilot = await this.copilotService.findTenantOneByRole(AiProviderRole.Primary)
			}
			let copilot: ICopilot = null
			if (primaryCopilot?.enabled) {
				copilot = primaryCopilot
			}

			const embeddings = await this.getEmbeddings(copilot)

			if (embeddings) {
				const vectorStore = new PGMemberVectorStore(copilot.provider, embeddings, {
					pool: this.pgPool,
					tableName: 'copilot_knowledge_vector',
					collectionTableName: 'copilot_knowledge_collection',
					collectionName: id,
					columns: {
						idColumnName: 'id',
						vectorColumnName: 'vector',
						contentColumnName: 'content',
						metadataColumnName: 'metadata'
					}
				})

				await vectorStore.ensureTableInDatabase()

				this.vectorStores.set(id, vectorStore)
				return this.vectorStores.get(id)
			}

			return null
		}

		return this.vectorStores.get(id)
	}

	async getCommands(options?: FindManyOptions<CopilotKnowledge>) {
		const condition = this.findOneWithTenant(options)
		return this.repository
			.createQueryBuilder('knowledge')
			.select('knowledge.command')
			.distinctOn(['knowledge.command'])
			.where(condition?.where)
			.getMany()
	}

	async createBulk(
		entities: ICopilotKnowledge[],
		roles: ICopilotRole[],
		options: { createRole: boolean; clearRole: boolean }
	) {
		const { createRole, clearRole } = options || {}
		const roleNames = uniq(entities.map((example) => example.role))

		if (roles) {
			for await (const role of roles) {
				try {
					await this.commandBus.execute(new CopilotRoleCreateCommand(role))
				} catch (error) {}
			}
		}

		// Auto create role if not existed
		if (createRole) {
			for await (const role of compact(roleNames).filter((role) => !roles.find((r) => r.name === role))) {
				try {
					await this.commandBus.execute(new CopilotRoleCreateCommand({ name: role }))
				} catch (error) {}
			}
		}

		const results = []

		// Add examples to vector store
		for (const role of roleNames) {
			const vectorStore = await this.getVectorStore(role ? role : null)
			if (clearRole) {
				const { items } = await this.findAll({ where: { role: role } })
				await vectorStore?.vectorStore.delete({ filter: { role: role } })
				await this.repository.remove(items)
			}

			const examples = entities.filter((item) => (role ? item.role === role : !item.role)).map((example) => ({...example, input: example.input?.trim(), output: example.output?.trim() }))
				.filter((item) => !!item.command && !!item.input)
			const roleExamples = await Promise.all(examples.map((entity) => super.create(entity)))
			results.push(...roleExamples)
			if (roleExamples.length && vectorStore) {
				await vectorStore.addExamples(roleExamples)
				await Promise.all(roleExamples.map((entity) => super.update(entity.id, { provider: vectorStore.provider, vector: true })))
			}
		}

		return results
	}
}

class PGMemberVectorStore {
	vectorStore: PGVectorStore

	constructor(
		public provider: AiProvider,
		public embeddings: EmbeddingsInterface,
		_dbConfig: PGVectorStoreArgs
	) {
		this.vectorStore = new PGVectorStore(embeddings, _dbConfig)
	}

	async addExamples(examples: ICopilotKnowledge[]): Promise<void> {
		if (!examples.length) return

		const documents = examples.map(
			(example) =>
				new Document({
					metadata: {
						id: example.id,
						role: example.role,
						command: example.command,
						input: example.input,
						output: example.output
					},
					pageContent: example.input
				})
		)

		return await this.vectorStore.addDocuments(documents, {
			ids: examples.map((example) => example.id)
		})
	}

	async updateExamples(examples: ICopilotKnowledge[]): Promise<void> {
		// Delete old example vectors
		await this.vectorStore.delete({ ids: examples.map((example) => example.id) })

		// Add new example vectors
		await this.addExamples(examples)
	}

	async deleteExample(example: ICopilotKnowledge) {
		return await this.vectorStore.delete({ ids: [example.id] })
	}

	async clear() {
		return await this.vectorStore.delete({ filter: {} })
	}

	/**
	 * Create table for vector store if not exist
	 */
	async ensureTableInDatabase() {
		await this.vectorStore.ensureTableInDatabase()
		await this.vectorStore.ensureCollectionTableInDatabase()
	}
}
