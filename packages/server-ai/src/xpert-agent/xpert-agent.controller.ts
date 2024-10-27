import { IXpert, IXpertAgent } from '@metad/contracts'
import { CrudController, TransformInterceptor } from '@metad/server-core'
import { Body, Controller, Header, Logger, Post, Sse, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CommandBus } from '@nestjs/cqrs'
import { Observable } from 'rxjs'
import { XpertAgent } from './xpert-agent.entity'
import { XpertAgentService } from './xpert-agent.service'
import { XpertAgentChatCommand } from './commands'

@ApiTags('XpertAgent')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class XpertAgentController extends CrudController<XpertAgent> {
	readonly #logger = new Logger(XpertAgentController.name)

	constructor(
		private readonly service: XpertAgentService,
		private readonly commandBus: CommandBus,
	) {
		super(service)
	}

	@Header('content-type', 'text/event-stream')
	@Post('chat')
	@Sse()
	async chatAgent(
		@Body() body: { input: string; agent: IXpertAgent; xpert: IXpert }
	): Promise<Observable<MessageEvent>> {
		return await this.commandBus.execute(new XpertAgentChatCommand(body.input, body.agent.key, body.xpert, {
			isDraft: true,
		}))
	}
}