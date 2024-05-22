import { Document } from '@langchain/core/documents'
import type { EmbeddingsInterface } from '@langchain/core/embeddings'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RedisVectorStore, RedisVectorStoreConfig } from '@langchain/redis'
import { AiBusinessRole, AiProvider } from '@metad/contracts'
import { DeepPartial } from '@metad/server-common'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RedisClientType } from 'redis'
import { Repository } from 'typeorm'
import { CopilotService } from '../copilot'
import { REDIS_CLIENT } from '../core'
import { TenantAwareCrudService } from '../core/crud'
import { CopilotExample } from './copilot-example.entity'
import { CopilotExampleVectorSeedCommand } from './commands'
import { CommandBus } from '@nestjs/cqrs'

@Injectable()
export class CopilotExampleService extends TenantAwareCrudService<CopilotExample> {
    readonly #logger = new Logger(CopilotExampleService.name)

    private readonly vectorStores = new Map<string, PGRedisVectorStore>()

    constructor(
        @InjectRepository(CopilotExample)
        repository: Repository<CopilotExample>,

        private copilotService: CopilotService,

        @Inject(REDIS_CLIENT)
        private readonly redisClient: RedisClientType,

		private readonly commandBus: CommandBus,
    ) {
        super(repository)
    }

    async seedRedisIfEmpty() {
        await this.commandBus.execute(new CopilotExampleVectorSeedCommand({

		}))
    }

    async similaritySearch(query: string, options?: { role?: AiBusinessRole; command?: string; k: number; filter: any }) {
        const { role, command, k, filter } = options ?? {}

        const vectorStore = await this.getVectorStore(role, command)
        return vectorStore.vectorStore.similaritySearch(query, k, filter)
    }

    async getVectorStore(role: AiBusinessRole | string, command: string, organizationId: string = null) {
        const where = {}
        if (organizationId) {
            where['organizationId'] = organizationId
        }
        const result = await this.copilotService.findAll({ where })
        const copilot = result.items[0]
        if (copilot && copilot.enabled && [AiProvider.OpenAI, AiProvider.Azure].includes(copilot.provider)) {
            const id = role ? `${role}${command ? ':' + command : ''}` : 'default'
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
                    new PGRedisVectorStore(this, role, embeddings, {
                        redisClient: this.redisClient,
                        indexName: `dm:${id}`
                    })
                )
            }

            return this.vectorStores.get(id)
        }

        return null
    }
}


class PGRedisVectorStore {
    vectorStore: RedisVectorStore

    constructor(
        private exampleService: CopilotExampleService,
        private role: string,
        private embeddings: EmbeddingsInterface,
        private _dbConfig: RedisVectorStoreConfig
    ) {
        this.vectorStore = new RedisVectorStore(embeddings, _dbConfig)
    }

    async checkIndexExists() {
        return this.vectorStore.checkIndexExists()
    }

    async storeExamples(members: DeepPartial<CopilotExample>[]) {
        members = members.map((member) => {
            return {
                ...member,
                content: ``
            }
        })

        const texts = members.map(({ content }) => content)
        const vectors = await this.embeddings.embedDocuments(texts)

        // const _members = await this.exampleService.bulkCreate(
        // 	this.modelId,
        // 	members.map((member, index) => ({
        // 		...member,
        // 		vector: vectors[index]
        // 	}))
        // )

        return this.addExamples(members as any[])
    }

    async addExamples(members: CopilotExample[]) {
        if (!members.length) return

        const vectors = members.map((member) => member.vector)
        const documents = members.map(
            (member) =>
                new Document({
                    metadata: {
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
