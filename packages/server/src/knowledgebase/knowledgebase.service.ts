import { DocumentInterface } from '@langchain/core/documents'
import { AiBusinessRole, AiProviderRole, ICopilot, IKnowledgebase, Metadata } from '@metad/contracts'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { Pool } from 'pg'
import { Repository } from 'typeorm'
import { CopilotService } from '../copilot'
import { RequestContext } from '../core'
import { TenantOrganizationAwareCrudService } from '../core/crud'
import { DATABASE_POOL_TOKEN } from '../database'
import { Knowledgebase } from './knowledgebase.entity'
import { KnowledgeDocumentVectorStore } from './vector-store'
import { KnowledgeSearchQuery } from './queries'
import { CopilotRoleService } from '../copilot-role/copilot-role.service'
import { sortBy } from 'lodash'

@Injectable()
export class KnowledgebaseService extends TenantOrganizationAwareCrudService<Knowledgebase> {
	readonly #logger = new Logger(KnowledgebaseService.name)

	constructor(
		@InjectRepository(Knowledgebase)
		repository: Repository<Knowledgebase>,
		private readonly copilotService: CopilotService,
		private readonly roleService: CopilotRoleService,
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
				knowledgebaseId: knowledgebase.id,
				...options
			})
		)

		return results
	}

	async getVectorStore(knowledgebase: IKnowledgebase, tenantId?: string, organizationId?: string) {
		let copilot: ICopilot = null
		// let model: string | null = null
		// const knowledgebase = await this.findOne({ where: { id: knowledgebaseId, tenantId, organizationId } })
		if (knowledgebase.copilotId) {
			copilot = await this.copilotService.findOne(knowledgebase.copilotId)
			// model = knowledgebase.embeddingModelId
		} else {
			copilot = await this.copilotService.findOneByRole(AiProviderRole.Embedding, tenantId, organizationId)
			if (!copilot?.enabled) {
				copilot = await this.copilotService.findOneByRole(AiProviderRole.Primary, tenantId, organizationId)
			}
			// model = copilot?.defaultModel
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
			role?: AiBusinessRole
			k?: number
			filter?: KnowledgeDocumentVectorStore['filter']
			score?: number
			tenantId?: string
			organizationId?: string
		}
	) {
		const { role, k, score, filter } = options ?? {}
		const tenantId = options?.tenantId ?? RequestContext.currentTenantId()
		const organizationId = options?.organizationId ?? RequestContext.getOrganizationId()

		const { record: copilotRole, success } = await this.roleService.findOneOrFail({ where: { name: role } })
		let knowledgebases: IKnowledgebase[] = []
		if (!success) {
			const result = await this.findAll()
			knowledgebases = result.items
		} else {
			//
		}

		const documents: {doc: DocumentInterface<Record<string, any>>; score: number;}[] = []
		const kbs = await Promise.all(
			knowledgebases.map((kb) => {
				return this.getVectorStore(kb, tenantId, organizationId).then((vectorStore) => {
					return vectorStore.similaritySearchWithScore(query, k, filter)
				})
			})
		)

		kbs.forEach((kb) => {
			kb.forEach(([doc, score]) => {
				documents.push({doc, score})
			})
		})

		return sortBy(documents, 'score', 'desc').slice(0, k).map(({doc}) => doc)
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
