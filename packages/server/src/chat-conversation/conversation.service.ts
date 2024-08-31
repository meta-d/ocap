import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, FindConditions, FindOneOptions, Repository } from 'typeorm'
import { ChatConversation } from './conversation.entity'
import { TenantOrganizationAwareCrudService } from '../core/crud'

@Injectable()
export class ChatConversationService extends TenantOrganizationAwareCrudService<ChatConversation> {
	private readonly logger = new Logger(ChatConversationService.name)

	constructor(
		@InjectRepository(ChatConversation)
		chatRepository: Repository<ChatConversation>,
		readonly commandBus: CommandBus
	) {
		super(chatRepository)
	}

}
