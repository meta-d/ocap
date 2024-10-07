import { CrudController, TransformInterceptor } from '@metad/server-core'
import { Controller, Logger, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { XpertAgent } from './xpert-agent.entity'
import { XpertAgentService } from './xpert-agent.service'

@ApiTags('XpertAgent')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class XpertAgentController extends CrudController<XpertAgent> {
	readonly #logger = new Logger(XpertAgentController.name)
	constructor(
		private readonly service: XpertAgentService,
		private readonly commandBus: CommandBus
	) {
		super(service)
	}
}
