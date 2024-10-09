import { CrudController, TransformInterceptor } from '@metad/server-core'
import { Controller, Logger, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
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
}
