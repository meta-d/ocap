import { IPagination } from '@metad/contracts'
import {
	CrudController,
	PaginationParams,
	ParseJsonPipe,
	RequestContext,
	UUIDValidationPipe
} from '@metad/server-core'
import { InjectQueue } from '@nestjs/bull'
import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Post,
	Query
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Queue } from 'bull'
import { SemanticModelEntity } from './entity.entity'
import { SemanticModelEntityService } from './entity.service'

@ApiTags('SemanticModelEntity')
@ApiBearerAuth()
@Controller()
export class ModelEntityController extends CrudController<SemanticModelEntity> {
	constructor(
		private readonly entityService: SemanticModelEntityService,
		@InjectQueue('entity')
		private readonly entityQueue: Queue
	) {
		super(entityService)
	}

	@ApiOperation({ summary: 'find all' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found records' /* type: IPagination<T> */
	})
	@Get()
	async findAlls(
		@Query('$fitler', ParseJsonPipe) where: PaginationParams<SemanticModelEntity>['where'],
		@Query('$relations', ParseJsonPipe) relations: PaginationParams<SemanticModelEntity>['relations']
	): Promise<IPagination<SemanticModelEntity>> {
		return this.entityService.findAll({ where, relations })
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
			const job = await this.entityQueue.add('syncMembers', {
				modelId: id,
				organizationId: organizationId,
				entityId: result.id,
				cube: entity.name,
				hierarchies: entity.options?.vector.hierarchies
			})

			entity.job = {
				id: job.id
			}

			await this.entityService.update(result.id, entity)
		}

		return result
	}
}
