import { CrudController, TransformInterceptor } from '@metad/server-core'
import { Controller, Logger, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { XpertTool } from './xpert-tool.entity'
import { XpertToolService } from './xpert-tool.service'

@ApiTags('XpertTool')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class XpertToolController extends CrudController<XpertTool> {
	readonly #logger = new Logger(XpertToolController.name)
	constructor(
		private readonly service: XpertToolService,
		private readonly commandBus: CommandBus
	) {
		super(service)
	}
}
