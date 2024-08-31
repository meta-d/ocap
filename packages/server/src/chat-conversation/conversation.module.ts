import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { ChatConversation } from './conversation.entity'
import { TenantModule } from '../tenant'
import { SharedModule } from '../shared'
import { CopilotCheckpointModule } from '../copilot-checkpoint'
import { ChatConversationController } from './conversation.controller'
import { ChatConversationService } from './conversation.service'

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
	providers: [ChatConversationService]
})
export class ChatConversationModule {}
