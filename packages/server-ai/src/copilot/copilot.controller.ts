import { AIPermissionsEnum, IPagination, ModelType } from '@metad/contracts'
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common'
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { DeepPartial } from 'typeorm'
import { CrudController, PaginationParams, TransformInterceptor, PermissionGuard, Permissions } from '@metad/server-core'
import { Copilot } from './copilot.entity'
import { CopilotService } from './copilot.service'
import { FindCopilotModelsQuery } from './queries';


@ApiTags('Copilot')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class CopilotController extends CrudController<Copilot> {
	constructor(
        private readonly service: CopilotService,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
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

    /**
     * get models by model type
     * @param type ModelType
     * @returns 
     */
	@Get('models')
	async getModels(@Query('type') type: ModelType) {
        return this.queryBus.execute(new FindCopilotModelsQuery(type))
	}

	@Get('provider/:name/model-parameters')
	async getModelParameters(@Query('model') model: string) {
		return []
	}
}
