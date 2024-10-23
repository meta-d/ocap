import { IXpert, IXpertAgent } from '@metad/contracts'
import { CrudController, TransformInterceptor } from '@metad/server-core'
import { Body, Controller, Header, Logger, Post, Sse, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Observable } from 'rxjs'
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
	) {
		super(service)
	}

	@Header('content-type', 'text/event-stream')
	@Post('chat')
	@Sse()
	async chatAgent(
		@Body() body: { input: string; agent: IXpertAgent; xpert: IXpert }
	): Promise<Observable<MessageEvent>> {
		return await this.service.executeAgent(body)
	}
}
