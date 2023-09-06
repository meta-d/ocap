import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { InjectRepository } from '@nestjs/typeorm'
import { TenantAwareCrudService } from '@metad/server-core'
import { EMPTY } from 'rxjs'
import { firstValueFrom } from 'rxjs/internal/firstValueFrom'
import { FindConditions, Repository, UpdateResult } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { InsightModel } from './insight-model.entity'

const channel = 'update-members'
const CMD_INSIGHTS = 'cmd-insights'

@Injectable()
export class InsightService extends TenantAwareCrudService<InsightModel> {
	constructor(
		@InjectRepository(InsightModel)
		repository: Repository<InsightModel>,
		@Inject('AI_SERVICE') private aiClient: ClientProxy
	) {
		super(repository)
	}

	public async update(
		id: string | number | FindConditions<InsightModel>,
		partialEntity: QueryDeepPartialEntity<InsightModel>,
		...options: any[]
	): Promise<UpdateResult | InsightModel> {
		const pattern = { cmd: channel }
		this.aiClient.send(pattern, JSON.stringify(partialEntity)).subscribe()
		return super.update(id, partialEntity, options)
	}

	public async suggests(statement: string) {
		try {
			const suggestions =  this.aiClient.send({ cmd: CMD_INSIGHTS }, statement)
			return firstValueFrom(suggestions)
		} catch(err) {
			return EMPTY
		}
	}
}
