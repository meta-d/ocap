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
		@Query('$filter', ParseJsonPipe) where: PaginationParams<SemanticModelEntity>['where'],
		@Query('$relations', ParseJsonPipe) relations: PaginationParams<SemanticModelEntity>['relations']
	): Promise<IPagination<SemanticModelEntity>> {
		return this.entityService.findAll({ where, relations })
	}

	@Post(':id')
	async createByModel(
		@Param('id', UUIDValidationPipe) modelId: string,
		@Body() entity: SemanticModelEntity
	): Promise<SemanticModelEntity> {
		entity.modelId = modelId
		const result = await this.entityService.create(entity)

		const tenantId = RequestContext.currentTenantId()
		const organizationId = RequestContext.getOrganizationId()
		const userId = RequestContext.currentUserId()

		if (entity.options?.vector?.hierarchies?.length) {
			const job = await this.entityQueue.add('syncMembers', {
				tenantId,
				organizationId,
				createdById: userId,
				modelId,
				entityId: result.id,
				cube: entity.name,
				hierarchies: entity.options?.vector.hierarchies,
			})

			await this.entityService.update(result.id, {
				job: {
					id: job.id,
					status: 'processing'
				}
			})

			return await this.entityService.findOne(result.id)
		}

		return result
	}
}
