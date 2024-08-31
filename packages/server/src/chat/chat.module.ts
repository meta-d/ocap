import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ChatController } from './chat.controller'
import { ChatEventsGateway } from './chat.gateway'
import { CommandHandlers } from './commands/handlers'
import { CopilotModule } from '../copilot'
import { CopilotCheckpointModule } from '../copilot-checkpoint'

@Module({
	imports: [CqrsModule, CopilotModule, CopilotCheckpointModule],
	controllers: [ChatController],
	providers: [ChatEventsGateway, ...CommandHandlers]
})
export class ChatModule {}
