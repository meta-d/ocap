import { IPagination } from '@metad/contracts'
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Query, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { DeepPartial } from 'typeorm'
import { CrudController, PaginationParams, TransformInterceptor } from '../core'
import { ParseJsonPipe, UseValidationPipe } from '../shared'
import { CopilotCheckpoint } from './copilot-checkpoint.entity'
import { CopilotCheckpointService } from './copilot-checkpoint.service'

@ApiTags('CopilotCheckpoint')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class CopilotCheckpointController extends CrudController<CopilotCheckpoint> {
	readonly #logger = new Logger(CopilotCheckpointController.name)

	constructor(private readonly service: CopilotCheckpointService) {
		super(service)
	}

	@Get()
	@UseValidationPipe()
	async getAll(
		@Query('$filter', ParseJsonPipe) where: PaginationParams<CopilotCheckpoint>['where'],
		@Query('$relations', ParseJsonPipe) relations: PaginationParams<CopilotCheckpoint>['relations'],
		@Query('$order', ParseJsonPipe) order: PaginationParams<CopilotCheckpoint>['order'],
	): Promise<IPagination<CopilotCheckpoint>> {
		return await this.service.findAll({ where, relations, order })
	}

	@ApiOperation({ summary: 'Create new record' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The record has been successfully created.' /*, type: T*/
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input, The response body may contain clues as to what went wrong'
	})
	@HttpCode(HttpStatus.CREATED)
	@Post()
	async create(@Body() entity: DeepPartial<CopilotCheckpoint>, ...options: any[]): Promise<CopilotCheckpoint> {
		return this.service.upsert(entity)
	}
}
