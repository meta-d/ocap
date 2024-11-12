import { CallbackManagerForRetrieverRun } from '@langchain/core/callbacks/manager'
import { Document, DocumentInterface } from '@langchain/core/documents'
import { BaseRetriever } from '@langchain/core/retrievers'
import { Logger } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { KnowledgeSearchQuery } from './queries'

/**
 * Docs Retriever for signle Knowledgebase
 */
export class KnowledgeRetriever extends BaseRetriever {
	lc_namespace = ['xpert', 'knowledgenase']
	
	readonly #logger = new Logger(KnowledgeRetriever.name)

	tenantId: string
	organizationId: string

	constructor(private readonly queryBus: QueryBus, private readonly knowledgebaseId) {
		super()
	}

	async _getRelevantDocuments(query: string, runManager?: CallbackManagerForRetrieverRun): Promise<Document[]> {
		this.#logger.debug(`Retrieving dimension members for query: ${query}`)

		// const results = await this.memberService.retrieveMembers(this.tenantId, this.organizationId, modelId, cube, query, 6)
		const results = await this.queryBus.execute<
			KnowledgeSearchQuery,
			{
				doc: DocumentInterface<Record<string, any>>
				score: number
			}[]
		>(
			new KnowledgeSearchQuery({
				tenantId: this.tenantId,
				organizationId: this.organizationId,
				knowledgebases: this.knowledgebaseId ? [this.knowledgebaseId] : [],
				query
			})
		)

		return results.map(({ doc }) => doc)
	}
}
