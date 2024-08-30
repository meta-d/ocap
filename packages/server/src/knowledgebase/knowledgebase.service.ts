import { DocumentInterface } from '@langchain/core/documents'
import { Metadata } from '@metad/contracts'
import { Injectable, Logger } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RequestContext } from '../core'
import { TenantOrganizationAwareCrudService } from '../core/crud'
import { KnowledgeSearchQuery } from '../knowledge-document/queries/'
import { Knowledgebase } from './knowledgebase.entity'

@Injectable()
export class KnowledgebaseService extends TenantOrganizationAwareCrudService<Knowledgebase> {
	readonly #logger = new Logger(KnowledgebaseService.name)

	constructor(
		@InjectRepository(Knowledgebase)
		repository: Repository<Knowledgebase>,
		private readonly queryBus: QueryBus
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
}
