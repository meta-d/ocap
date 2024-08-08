import { Controller, Logger, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CrudController, TransformInterceptor } from '../core'
import { CopilotUser } from './copilot-user.entity'
import { CopilotUserService } from './copilot-user.service'

@ApiTags('CopilotUser')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class CopilotUserController extends CrudController<CopilotUser> {
	readonly #logger = new Logger(CopilotUserController.name)
	constructor(
		readonly service: CopilotUserService,
		private readonly commandBus: CommandBus
	) {
		super(service)
	}
}
