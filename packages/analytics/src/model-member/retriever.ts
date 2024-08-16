import { CallbackManagerForRetrieverRun } from '@langchain/core/callbacks/manager'
import { BaseRetriever } from '@langchain/core/retrievers'
import { Logger } from '@nestjs/common'
import { Document } from '@langchain/core/documents'
import { SemanticModelMemberService } from './member.service'

export class DimensionMemberRetriever extends BaseRetriever {
	lc_namespace: string[]
	readonly #logger = new Logger(DimensionMemberRetriever.name)

	tenantId: string
	organizationId: string
	modelId: string
	cube: string

	constructor(private readonly memberService: SemanticModelMemberService) {
		super()
	}

	async _getRelevantDocuments(query: string, runManager?: CallbackManagerForRetrieverRun): Promise<Document[]> {
		this.#logger.debug(`Retrieving dimension members for query: ${query} in cube '${this.cube}'`)
		const modelId = this.modelId ?? ''
		const cube = this.cube

		const results = await this.memberService.retrieveMembers(this.tenantId, this.organizationId, modelId, cube, query, 6)

		this.#logger.debug(`Retrieved dimension members: ${results.length}`)
		
		return results.map((item) => new Document(item))
	}
}

export function createDimensionMemberRetriever(context: {logger: Logger}, service: SemanticModelMemberService) {
	return new DimensionMemberRetriever(service)
}
