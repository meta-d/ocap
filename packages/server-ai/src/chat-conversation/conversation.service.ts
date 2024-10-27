import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PaginationParams, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { ChatConversation } from './conversation.entity'

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

	async findAllByXpert(xpertId: string, options: PaginationParams<ChatConversation>) {
		return this.findAll({
			...options,
			where: {
				xpertId,
			}
		})
	}
}
