import { DocumentInterface } from '@langchain/core/documents'
import { AiBusinessRole, AiProviderRole, ICopilot, IKnowledgebase, Metadata } from '@metad/contracts'
import { DATABASE_POOL_TOKEN, RequestContext, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { sortBy } from 'lodash'
import { Pool } from 'pg'
import { In, IsNull, Not, Repository } from 'typeorm'
import { CopilotService } from '../copilot'
import { Knowledgebase } from './knowledgebase.entity'
import { KnowledgeSearchQuery } from './queries'
import { KnowledgeDocumentVectorStore } from './vector-store'

@Injectable()
export class KnowledgebaseService extends TenantOrganizationAwareCrudService<Knowledgebase> {
	readonly #logger = new Logger(KnowledgebaseService.name)

	constructor(
		@InjectRepository(Knowledgebase)
		repository: Repository<Knowledgebase>,
		private readonly copilotService: CopilotService,
		private readonly queryBus: QueryBus,
		@Inject(DATABASE_POOL_TOKEN) private readonly pgPool: Pool
	) {
		super(repository)
	}

	async test(id: string, options: { query: string; k?: number; filter?: Metadata }) {
		const knowledgebase = await this.findOne(id)
		const tenantId = RequestContext.currentTenantId()
		const organizationId = RequestContext.getOrganizationId()

		const results = await this.queryBus.execute<KnowledgeSearchQuery, [DocumentInterface, number][]>(
			new KnowledgeSearchQuery({
				tenantId,
				organizationId,
				knowledgebases: [knowledgebase.id],
				...options
			})
		)

		return results
	}

	async getVectorStore(knowledgebase: IKnowledgebase, tenantId?: string, organizationId?: string) {
		let copilot: ICopilot = null
		if (knowledgebase.copilotId) {
			copilot = await this.copilotService.findOne(knowledgebase.copilotId)
		} else {
			copilot = await this.copilotService.findCopilot(tenantId, organizationId, AiProviderRole.Embedding)
		}

		if (!copilot?.enabled) {
			throw new Error('No copilot found')
		}

		const vectorStore = new KnowledgeDocumentVectorStore(knowledgebase, this.pgPool, copilot)

		// Create table for vector store if not exist
		await vectorStore.ensureTableInDatabase()

		return vectorStore
	}

	async similaritySearch(
		query: string,
		options?: {
			// role?: AiBusinessRole
			k?: number
			filter?: KnowledgeDocumentVectorStore['filter']
			score?: number
			tenantId?: string
			organizationId?: string
			knowledgebases?: string[]
		}
	) {
		const { knowledgebases, k, score, filter } = options ?? {}
		const tenantId = options?.tenantId ?? RequestContext.currentTenantId()
		const organizationId = options?.organizationId ?? RequestContext.getOrganizationId()
		const result = await this.findAll({
			where: {
				tenantId,
				organizationId,
				id: knowledgebases ? In(knowledgebases) : Not(IsNull())
			}
		})
		const _knowledgebases = result.items

		const documents: { doc: DocumentInterface<Record<string, any>>; score: number }[] = []
		const kbs = await Promise.all(
			_knowledgebases.map((kb) => {
				return this.getVectorStore(kb, tenantId, organizationId).then((vectorStore) => {
					return vectorStore.similaritySearchWithScore(query, k, filter)
				})
			})
		)

		kbs.forEach((kb) => {
			kb.forEach(([doc, score]) => {
				documents.push({ doc, score })
			})
		})

		return sortBy(documents, 'score', 'desc')
			.filter(({ score: _score }) => 1 - _score >= (score ?? 0.1))
			.slice(0, k)
			.map(({ doc }) => doc)
	}

	async maxMarginalRelevanceSearch(
		query: string,
		options?: {
			role?: AiBusinessRole
			k: number
			filter: Record<string, any>
			tenantId?: string
			organizationId?: string
		}
	) {
		//
	}
}
