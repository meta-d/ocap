import { TXpertTeamDraft } from '@metad/contracts'
import { CrudController, OptionParams, PaginationParams, ParseJsonPipe, RequestContext, TransformInterceptor, UUIDValidationPipe } from '@metad/server-core'
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Param,
	Post,
	Query,
	UseInterceptors,
	Header,
	Sse
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Xpert } from './xpert.entity'
import { XpertService } from './xpert.service'
import { XpertPublicDTO } from './dto'
import { DeleteResult } from 'typeorm'
import { XpertChatCommand } from './commands'
import { FindExecutionsByXpertQuery } from '../xpert-agent-execution/queries'
import { XpertAgentExecution } from '../core/entities/internal'

@ApiTags('Xpert')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class XpertController extends CrudController<Xpert> {
	readonly #logger = new Logger(XpertController.name)
	constructor(
		private readonly service: XpertService,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {
		super(service)
	}

	@Get('by-workspace/:id')
	async getAllByWorkspace(
		@Param('id') workspaceId: string,
		@Query('data', ParseJsonPipe) data: PaginationParams<Xpert>,
		@Query('published') published?: boolean
	) {
		const result = await this.service.getAllByWorkspace(workspaceId, data, published, RequestContext.currentUser())
		return {
			...result,
			items: result.items.map((item) => new XpertPublicDTO(item))
		}
	}
	
	@Get('validate')
	async validateTitle(@Query('title') title: string) {
		return this.service.validateTitle(title).then((items) => items.map((item) => new XpertPublicDTO(item)))
	}

	@Get(':id/team')
	async getTeam(@Param('id') id: string, @Query('data', ParseJsonPipe) data: OptionParams<Xpert>) {
		return this.service.getTeam(id, data)
	}

	@Get(':id/version')
	async allVersions(@Param('id') id: string) {
		return this.service.allVersions(id)
	}

	@Post(':id/draft')
	async saveDraft(@Param('id') roleId: string, @Body() body: TXpertTeamDraft) {
		// todo 检查有权限编辑此 xpert role
		body.savedAt = new Date()
		// Save draft
		return await this.service.saveDraft(roleId, body)
	}

	@Post(':id/publish')
	async publish(@Param('id') id: string) {
		return this.service.publish(id)
	}

	@Get(':id/executions')
	async getExecutions(@Param('id') id: string, @Query('$order', ParseJsonPipe) order?: PaginationParams<XpertAgentExecution>['order'],) {
		return this.queryBus.execute(new FindExecutionsByXpertQuery(id, {order}))
	}

	@Header('content-type', 'text/event-stream')
	@Post(':id/chat')
	@Sse()
	async chat(@Param('id') id: string, @Body() body: {input: string; draft: boolean; conversationId?: string;}) {
		return await this.commandBus.execute(new XpertChatCommand(body.input, id, body))
	}

	@ApiOperation({ summary: 'Delete record' })
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'The record has been successfully deleted'
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@HttpCode(HttpStatus.ACCEPTED)
	@Delete(':id')
	async delete(@Param('id', UUIDValidationPipe) id: string, 
		...options: any[]
	): Promise<Xpert | DeleteResult> {
		return this.service.deleteXpert(id)
	}
}
