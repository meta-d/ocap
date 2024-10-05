import { IPagination } from '@metad/contracts'
import { CrudController, PaginationParams, ParseJsonPipe, RequestContext, TransformInterceptor, UUIDValidationPipe } from '@metad/server-core'
import { Controller, Get, HttpStatus, Param, Query, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ChatConversation } from './conversation.entity'
import { ChatConversationService } from './conversation.service'
import { ChatConversationPublicDTO } from './dto'

@ApiTags('ChatConversation')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
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
		return this.service.findAll({ ...filter, where: { createdById: RequestContext.currentUserId() } })
	}

	@ApiOperation({ summary: 'Find by id' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found one record' /*, type: T*/
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get(':id')
	async findById(
		@Param('id', UUIDValidationPipe) id: string,
		@Query('$relations', ParseJsonPipe) relations?: PaginationParams<ChatConversation>['relations'],
		@Query('$select', ParseJsonPipe) select?: PaginationParams<ChatConversation>['select'],
		...options: any[]
	): Promise<ChatConversation> {
		const entity = await this.service.findOne(id, { select, relations })
		return new ChatConversationPublicDTO(entity)
	}
}
