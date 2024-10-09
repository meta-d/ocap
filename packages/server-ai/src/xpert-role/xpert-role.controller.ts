import { CrudController, ParseJsonPipe, RequestContext, TransformInterceptor } from '@metad/server-core'
import { Controller, Get, Logger, Param, Query, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { XpertRole } from './xpert-role.entity'
import { XpertRoleService } from './xpert-role.service'

@ApiTags('XpertRole')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class XpertRoleController extends CrudController<XpertRole> {
	readonly #logger = new Logger(XpertRoleController.name)
	constructor(
		private readonly service: XpertRoleService,
		private readonly commandBus: CommandBus
	) {
		super(service)
	}

	@Get('by-workspace/:id')
	async getAllByWorkspace(@Param('id') workspaceId: string, @Query('data', ParseJsonPipe) data: any) {
		return this.service.getAllByWorkspace(workspaceId, data, RequestContext.currentUser())
	}
}
