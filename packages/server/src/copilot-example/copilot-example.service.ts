import { Document } from '@langchain/core/documents'
import type { EmbeddingsInterface } from '@langchain/core/embeddings'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RedisVectorStore, RedisVectorStoreConfig } from '@langchain/redis'
import { AiBusinessRole, AiProvider, ICopilotExample } from '@metad/contracts'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { RedisClientType } from 'redis'
import { DeleteResult, FindOneOptions, Repository, UpdateResult } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { CopilotService } from '../copilot/copilot.service'
import { RequestContext } from '../core'
import { TenantAwareCrudService } from '../core/crud'
import { REDIS_CLIENT } from '../core/redis.module'
import { TenantService } from '../tenant/tenant.service'
import { CopilotExampleVectorSeedCommand } from './commands'
import { CopilotExample } from './copilot-example.entity'

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

        private readonly commandBus: CommandBus,
    ) {
        super(repository)
    }

    async seedRedisIfEmpty() {
        const { items: tenants } = await this.tenantService.findAll()
        for (const tenant of tenants) {
            await this.commandBus.execute(new CopilotExampleVectorSeedCommand({ tenantId: tenant.id }))
        }
    }

    async similaritySearch(query: string, options?: { role?: AiBusinessRole; command?: string; k: number; filter: any }) {
        const { role, command, k, filter } = options ?? {}

        const tenantId = RequestContext.currentTenantId()
        const vectorStore = await this.getVectorStore(tenantId, role, command)
        if (vectorStore) {
            return await vectorStore.vectorStore.similaritySearch(query, k, filter) 
        }

        return null
    }

    async maxMarginalRelevanceSearch(query: string, options?: { role?: AiBusinessRole; command?: string; k: number; filter: any }) {
        const { role, command, k, filter } = options ?? {}

        const tenantId = RequestContext.currentTenantId()
        const vectorStore = await this.getVectorStore(tenantId, role, command)

        if (vectorStore) {
            return await vectorStore.vectorStore.maxMarginalRelevanceSearch(query, options, undefined)
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
        const vectorStore = await this.getVectorStore(tenantId, entity.role, entity.command)
        if (vectorStore && !entity.vector) {
            const examples = await this.embedExamples(vectorStore, [entity])
            entity = examples[0]
        }
        const result = await super.update(id, entity)

        // Update the vector store
        await this.commandBus.execute(new CopilotExampleVectorSeedCommand({ tenantId, refresh: true }))

        return result
    }

    private async tryEmbedExample(entity: ICopilotExample) {
        const tenantId = RequestContext.currentTenantId()
        const vectorStore = await this.getVectorStore(tenantId, entity.role, entity.command)
        if (vectorStore && !entity.vector) {
            const examples = await this.embedExamples(vectorStore, [entity])
            entity = examples[0]
        }
        if (vectorStore) {
            vectorStore.addExamples([entity])
        }
        return entity
    }

    private async embedExamples(vectorStore: PGRedisVectorStore, examples: Partial<ICopilotExample>[]) {
        examples.forEach((example) => {
            example.content ??= example.input
            example.metadata = {
                role: example.role,
                command: example.command,
                input: example.input,
                output: example.output,
            }
        })
        const texts = examples.map(({ content }) => content)
        const vectors = await vectorStore.embeddings.embedDocuments(texts)
        examples.forEach((example, index) => (example.vector = vectors[index]))
        return examples
    }

    async getVectorStore(tenantId: string, role: AiBusinessRole | string, command: string, organizationId: string = null) {
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
            const id = tenantId + `:${role || 'default'}${command ? ':' + command : ''}`
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
                    new PGRedisVectorStore(embeddings, {
                        redisClient: this.redisClient,
                        indexName: `copilot-examples:${id}`
                    })
                )
            }

            return this.vectorStores.get(id)
        }

        return null
    }

    override async delete(criteria: string,
        options?: FindOneOptions<CopilotExample>
    ): Promise<DeleteResult> {
        const result = await super.delete(criteria, options)
        await this.commandBus.execute(new CopilotExampleVectorSeedCommand({ tenantId: RequestContext.currentTenantId(), refresh: true }))
        return result
    }
}


class PGRedisVectorStore {
    vectorStore: RedisVectorStore

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

        console.log(vectors, documents)

        return this.vectorStore.addVectors(vectors, documents)
    }

    async clear() {
        return await this.vectorStore.delete({ deleteAll: true })
    }
}
