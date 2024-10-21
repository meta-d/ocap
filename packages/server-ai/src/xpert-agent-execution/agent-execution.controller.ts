import { CrudController, TransformInterceptor } from '@metad/server-core'
import { Controller, Logger, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { XpertAgentExecution } from './agent-execution.entity'
import { XpertAgentExecutionService } from './agent-execution.service'

@ApiTags('XpertAgentExecution')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class XpertAgentExecutionController extends CrudController<XpertAgentExecution> {
	readonly #logger = new Logger(XpertAgentExecutionController.name)
	constructor(
		private readonly service: XpertAgentExecutionService,
		private readonly commandBus: CommandBus
	) {
		super(service)
	}
}
