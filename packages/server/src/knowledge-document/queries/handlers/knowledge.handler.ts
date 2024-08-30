import { DocumentInterface } from '@langchain/core/documents'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { KnowledgeDocumentService } from '../../document.service'
import { KnowledgeSearchQuery } from '../knowledge.query'

@QueryHandler(KnowledgeSearchQuery)
export class KnowledgeSearchQueryHandler implements IQueryHandler<KnowledgeSearchQuery> {
	constructor(private readonly knowledgeDocumentService: KnowledgeDocumentService) {}

	public async execute(command: KnowledgeSearchQuery): Promise<[DocumentInterface, number][]> {
		const { tenantId, organizationId, knowledgebaseId, query, k, filter } = command.input
		const vectorStore = await this.knowledgeDocumentService.getVectorStore(
			knowledgebaseId,
			tenantId,
			organizationId
		)
		return await vectorStore.similaritySearchWithScore(query, k, filter)
	}
}
