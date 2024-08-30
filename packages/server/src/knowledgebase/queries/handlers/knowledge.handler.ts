import { DocumentInterface } from '@langchain/core/documents'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { KnowledgeSearchQuery } from '../knowledge.query'
import { KnowledgebaseService } from '../../knowledgebase.service'
import { RequestContext } from '../../../core/context'

@QueryHandler(KnowledgeSearchQuery)
export class KnowledgeSearchQueryHandler implements IQueryHandler<KnowledgeSearchQuery> {
	constructor(private readonly knowledgebaseService: KnowledgebaseService) {}

	public async execute(command: KnowledgeSearchQuery): Promise<[DocumentInterface, number][]> {
		const { knowledgebaseId, query, k, filter } = command.input
		const tenantId = command.input.tenantId ?? RequestContext.currentTenantId()
		const organizationId = command.input.organizationId ?? RequestContext.getOrganizationId()
		const knowledgebase = await this.knowledgebaseService.findOne({ where: { tenantId, organizationId, id: knowledgebaseId } })
		const vectorStore = await this.knowledgebaseService.getVectorStore(
			knowledgebase,
			tenantId,
			organizationId
		)
		return await vectorStore.similaritySearchWithScore(query, k, filter)
	}
}
