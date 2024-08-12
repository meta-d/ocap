import { CopilotCheckpointService, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, FindConditions, FindOneOptions, Repository } from 'typeorm'
import { ChatBIConversation } from './conversation.entity'

@Injectable()
export class ChatBIConversationService extends TenantOrganizationAwareCrudService<ChatBIConversation> {
	private readonly logger = new Logger(ChatBIConversationService.name)

	constructor(
		@InjectRepository(ChatBIConversation)
		chatRepository: Repository<ChatBIConversation>,
		private readonly copilotCheckpointService: CopilotCheckpointService,
		readonly commandBus: CommandBus
	) {
		super(chatRepository)
	}

	async delete(
		criteria: string | FindConditions<ChatBIConversation>,
		options?: FindOneOptions<ChatBIConversation>
	): Promise<DeleteResult> {
		const item = await this.findOne(criteria)
		await this.copilotCheckpointService.deleteByThreadId(item.key)
		return await super.delete(criteria, options)
	}
}
