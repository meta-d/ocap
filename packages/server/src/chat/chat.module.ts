import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ChatController } from './chat.controller'
import { ChatEventsGateway } from './chat.gateway'
import { CommandHandlers } from './commands/handlers'
import { CopilotModule } from '../copilot'
import { CopilotCheckpointModule } from '../copilot-checkpoint'
import { KnowledgebaseModule } from '../knowledgebase/knowledgebase.module'
import { ChatService } from './chat.service'

@Module({
	imports: [CqrsModule, CopilotModule, CopilotCheckpointModule, KnowledgebaseModule],
	controllers: [ChatController],
	providers: [ChatEventsGateway, ChatService, ...CommandHandlers],
	exports: [ChatService]
})
export class ChatModule {}
