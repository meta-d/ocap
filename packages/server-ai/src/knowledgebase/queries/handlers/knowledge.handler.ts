import { DocumentInterface } from '@langchain/core/documents'
import { RequestContext } from '@metad/server-core'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { sortBy } from 'lodash'
import { In, IsNull, Not } from 'typeorm'
import { KnowledgebaseService } from '../../knowledgebase.service'
import { KnowledgeSearchQuery } from '../knowledge.query'

@QueryHandler(KnowledgeSearchQuery)
export class KnowledgeSearchQueryHandler implements IQueryHandler<KnowledgeSearchQuery> {
	constructor(private readonly knowledgebaseService: KnowledgebaseService) {}

	public async execute(command: KnowledgeSearchQuery): Promise<{ doc: DocumentInterface; score: number }[]> {
		const { knowledgebases, query, k, score, filter } = command.input
		const tenantId = command.input.tenantId ?? RequestContext.currentTenantId()
		const organizationId = command.input.organizationId ?? RequestContext.getOrganizationId()
		const result = await this.knowledgebaseService.findAll({
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
				return this.knowledgebaseService.getVectorStore(kb, tenantId, organizationId)
					.then((vectorStore) => vectorStore.similaritySearchWithScore(query, 30, filter))
					.then((docs) => docs.map(([doc, score]) => ({ doc, score }))
						.filter(({ score: _score }) => 1 - _score >= (score || kb.similarityThreshold || .5)))
			})
		)

		kbs.forEach((items) => {
			items.forEach((item) => {
				documents.push(item)
			})
		})

		return sortBy(documents, 'score', 'desc')
			// .filter(({ score: _score }) => 1 - _score >= (score ?? 0.1))
			.slice(0, k)
	}
}
