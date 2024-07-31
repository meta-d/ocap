import { TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ChatBIConversation } from './conversation.entity'

@Injectable()
export class ChatBIConversationService extends TenantOrganizationAwareCrudService<ChatBIConversation> {
	private readonly logger = new Logger(ChatBIConversationService.name)

	constructor(
		@InjectRepository(ChatBIConversation)
		chatRepository: Repository<ChatBIConversation>,
		readonly commandBus: CommandBus
	) {
		super(chatRepository)
	}
}
