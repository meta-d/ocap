import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { ChatConversation } from './conversation.entity'
import { TenantModule } from '@metad/server-core'
import { SharedModule } from '@metad/server-core'
import { CopilotCheckpointModule } from '../copilot-checkpoint'
import { ChatConversationController } from './conversation.controller'
import { ChatConversationService } from './conversation.service'
import { CommandHandlers } from './commands/handlers'
import { QueryHandlers } from './queries/handlers'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/chat-conversation', module: ChatConversationModule }]),
		forwardRef(() => TypeOrmModule.forFeature([ChatConversation])),
		forwardRef(() => TenantModule),
		SharedModule,
		CqrsModule,
		CopilotCheckpointModule
	],
	controllers: [ChatConversationController],
	providers: [ChatConversationService, ...CommandHandlers, ...QueryHandlers]
})
export class ChatConversationModule {}
