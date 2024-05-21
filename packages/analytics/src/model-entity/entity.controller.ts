import { IPagination } from '@metad/contracts'
import {
	CrudController,
	PaginationParams,
	RequestContext,
	UUIDValidationPipe
} from '@metad/server-core'
import { InjectQueue } from '@nestjs/bull'
import {
	Body,
	Controller,
	Get,
	Param,
	Post
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Queue } from 'bull'
import { SemanticModelEntity } from './entity.entity'
import { SemanticModelEntityService } from './entity.service'

@ApiTags('SemanticModelEntity')
@ApiBearerAuth()
@Controller()
export class ModelEntityController extends CrudController<SemanticModelEntity> {
	constructor(
		private readonly entityService: SemanticModelEntityService,
		@InjectQueue('member')
		private readonly memberQueue: Queue
	) {
		super(entityService)
	}

	@Get(':id')
	getAllByModel(
		@Param('id') id: string,
		filter?: PaginationParams<SemanticModelEntity>,
		...options: any[]
	): Promise<IPagination<SemanticModelEntity>> {
		return this.entityService.findAll({ where: { modelId: id } })
	}

	@Post(':id')
	async createByModel(
		@Param('id', UUIDValidationPipe) id: string,
		@Body() entity: SemanticModelEntity
	): Promise<SemanticModelEntity> {
		entity.modelId = id
		const result = await this.entityService.create(entity)

		const organizationId = RequestContext.getOrganizationId()

		if (entity.options?.vector?.hierarchies?.length) {
			const job = await this.memberQueue.add('syncMembers', {
				modelId: id,
				organizationId: organizationId,
				entityId: result.id,
				cube: entity.name,
				hierarchies: entity.options?.vector.hierarchies
			})

			entity.options.vector.jobId = job.id
		}

		return result
	}
}
