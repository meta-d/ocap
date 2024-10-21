import { MessageContent } from '@langchain/core/messages'
import { IXpert, IXpertAgent } from '@metad/contracts'
import { CrudController, TransformInterceptor } from '@metad/server-core'
import { Body, Controller, Header, Logger, Post, Sse, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { map, Observable } from 'rxjs'
import { XpertAgentExecuteCommand } from './commands'
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

	@Header('content-type', 'text/event-stream')
	@Post('chat')
	@Sse()
	async chatAgent(
		@Body() { input, agent, xpert }: { input: string; agent: IXpertAgent; xpert: IXpert }
	): Promise<Observable<MessageEvent>> {
		const output = await this.commandBus.execute<XpertAgentExecuteCommand, Observable<MessageContent>>(
			new XpertAgentExecuteCommand(input, agent, xpert)
		)

		return output.pipe(map((messageContent: MessageContent) => ({ data: messageContent }) as MessageEvent))
	}
}
