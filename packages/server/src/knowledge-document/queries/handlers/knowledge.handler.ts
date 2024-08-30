import { DocumentInterface } from '@langchain/core/documents'
import { AiProviderRole } from '@metad/contracts'
import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Pool } from 'pg'
import { CopilotService } from '../../../copilot'
import { DATABASE_POOL_TOKEN } from '../../../database'
import { KnowledgebaseService } from '../../../knowledgebase/knowledgebase.service'
import { createEmbeddings } from '../../types'
import { KnowledgeDocumentVectorStore } from '../../vector-store'
import { KnowledgeSearchQuery } from '../knowledge.query'

@QueryHandler(KnowledgeSearchQuery)
export class KnowledgeSearchQueryHandler implements IQueryHandler<KnowledgeSearchQuery> {
	constructor(
		private readonly copilotService: CopilotService,
		private readonly knowledgebaseService: KnowledgebaseService,
		@Inject(DATABASE_POOL_TOKEN) private readonly pgPool: Pool
	) {}

	public async execute(command: KnowledgeSearchQuery): Promise<[DocumentInterface, number][]> {
		const { tenantId, organizationId, knowledgebaseId, query, k, filter } = command.input
		const knowledgebase = await this.knowledgebaseService.findOne(knowledgebaseId)

		let copilot = await this.copilotService.findOneByRole(AiProviderRole.Embedding, tenantId, organizationId)
		if (!copilot?.enabled) {
			copilot = await this.copilotService.findOneByRole(AiProviderRole.Primary, tenantId, organizationId)
		}
		if (!copilot?.enabled) {
			throw new Error('No copilot found')
		}

		const embeddings = createEmbeddings(copilot)

		const vectorStore = new KnowledgeDocumentVectorStore(knowledgebase, embeddings, this.pgPool)

		return await vectorStore.similaritySearchWithScore(query, k, filter)
	}
}
