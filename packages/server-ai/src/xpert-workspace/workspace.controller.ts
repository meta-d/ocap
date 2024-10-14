import { DeepPartial } from '@metad/server-common'
import { CrudController, RequestContext, TransformInterceptor } from '@metad/server-core'
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { XpertWorkspace } from './workspace.entity'
import { XpertWorkspaceService } from './workspace.service'

@ApiTags('XpertWorkspace')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class XpertWorkspaceController extends CrudController<XpertWorkspace> {
	readonly #logger = new Logger(XpertWorkspaceController.name)
	constructor(
		private readonly service: XpertWorkspaceService,
		private readonly commandBus: CommandBus
	) {
		super(service)
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
	async create(@Body() entity: DeepPartial<XpertWorkspace>): Promise<XpertWorkspace> {
		entity.ownerId = RequestContext.currentUserId()
		return this.service.create(entity)
	}
}
