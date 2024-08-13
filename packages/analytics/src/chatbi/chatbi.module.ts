import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CopilotModule } from '@metad/server-core'
import { CommandHandlers } from './commands/handlers'
import { ChatBIService } from './chatbi.service'
import { SemanticModelMemberModule } from '../model-member/index'

@Module({
	imports: [
		CqrsModule,
		CopilotModule,
		SemanticModelMemberModule
	],
	controllers: [],
	providers: [ChatBIService, ...CommandHandlers],
	exports: []
})
export class ChatBIModule {}
