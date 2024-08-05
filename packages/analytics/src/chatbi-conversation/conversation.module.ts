import { SharedModule, TenantModule } from '@metad/server-core'
import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { ChatBIConversationController } from './conversation.controller'
import { ChatBIConversation } from './conversation.entity'
import { ChatBIConversationService } from './conversation.service'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/chatbi-conversation', module: ChatBIConversationModule }]),
		forwardRef(() => TypeOrmModule.forFeature([ChatBIConversation])),
		forwardRef(() => TenantModule),
		SharedModule,
		CqrsModule
	],
	controllers: [ChatBIConversationController],
	providers: [ChatBIConversationService]
})
export class ChatBIConversationModule {}
