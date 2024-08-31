import { IPagination } from '@metad/contracts'
import { Controller, Get, HttpStatus, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ChatConversation } from './conversation.entity'
import { ChatConversationService } from './conversation.service'
import { CrudController, PaginationParams } from '../core/crud'
import { RequestContext } from '../core/context'
import { ParseJsonPipe } from '../shared/pipes'

@ApiTags('ChatConversation')
@ApiBearerAuth()
@Controller()
export class ChatConversationController extends CrudController<ChatConversation> {
	constructor(private readonly service: ChatConversationService) {
		super(service)
	}

	@ApiOperation({ summary: 'find my all' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found my records'
	})
	@Get('my')
	async findMyAll(
		@Query('data', ParseJsonPipe) filter?: PaginationParams<ChatConversation>,
		...options: any[]
	): Promise<IPagination<ChatConversation>> {
		return this.service.findAll({...filter, where: {createdById: RequestContext.currentUserId()}})
	}
}
