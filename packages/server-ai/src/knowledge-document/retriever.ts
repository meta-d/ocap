// import { CallbackManagerForRetrieverRun } from '@langchain/core/callbacks/manager'
// import { Document } from '@langchain/core/documents'
// import { BaseRetriever } from '@langchain/core/retrievers'
// import { Logger } from '@nestjs/common'
// import { QueryBus } from '@nestjs/cqrs'
// import { KnowledgeSearchQuery } from './queries'

// export class KnowledgeDocumentRetriever extends BaseRetriever {
// 	lc_namespace: string[]
// 	readonly #logger = new Logger(KnowledgeDocumentRetriever.name)

// 	tenantId: string
// 	organizationId: string
// 	knowledgebaseId: string

// 	constructor(private readonly queryBus: QueryBus) {
// 		super()
// 	}

// 	async _getRelevantDocuments(query: string, runManager?: CallbackManagerForRetrieverRun): Promise<Document[]> {
// 		this.#logger.debug(`Retrieving dimension members for query: ${query}`)
// 		const knowledgebaseId = this.knowledgebaseId ?? ''

// 		// const results = await this.memberService.retrieveMembers(this.tenantId, this.organizationId, modelId, cube, query, 6)
// 		const results = await this.queryBus.execute(new KnowledgeSearchQuery({
// 			tenantId: this.tenantId,
// 			organizationId: this.organizationId,
// 			knowledgebaseId,
// 			query
// 		}))

// 		// this.#logger.debug(`Retrieved dimension members: ${results.length}`)

// 		return []
// 	}
// }
