import { Metadata } from '@metad/contracts'
import { IQuery } from '@nestjs/cqrs'

export class KnowledgeSearchQuery implements IQuery {
	static readonly type = '[Knowledge] Similarity Search'

	constructor(
		public readonly input: {
			tenantId: string
			organizationId: string
			knowledgebaseId: string
			query: string
			k?: number
			score?: number
			filter?: Metadata
		}
	) {}
}
