import { AIPermissionsEnum, IPagination } from '@metad/contracts'
import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { DeepPartial } from 'typeorm'
import { CrudController, PaginationParams, TransformInterceptor, PermissionGuard, Permissions } from '@metad/server-core'
import { Copilot } from './copilot.entity'
import { CopilotService } from './copilot.service'

@ApiTags('Copilot')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class CopilotController extends CrudController<Copilot> {
	constructor(private readonly service: CopilotService, private readonly commandBus: CommandBus) {
		super(service)
	}

	@ApiOperation({ summary: 'find all' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found records' /* type: IPagination<T> */
	})
	@Get()
	async findAll(
		filter?: PaginationParams<Copilot>,
		...options: any[]
	): Promise<IPagination<Copilot>> {
		return this.service.findAvalibles(filter)
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
	@UseGuards(PermissionGuard)
	@Permissions(AIPermissionsEnum.COPILOT_EDIT)
	@HttpCode(HttpStatus.CREATED)
	@Post()
	async create(@Body() entity: DeepPartial<Copilot>): Promise<Copilot> {
		return this.service.upsert(entity)
	}
}
