import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CopilotCheckpointModule, CopilotKnowledgeModule, CopilotModule } from '@metad/server-core'
import { CommandHandlers } from './commands/handlers'
import { ChatBIService } from './chatbi.service'
import { SemanticModelMemberModule } from '../model-member/index'
import { OcapModule } from '../model/ocap'
import { provideOcap } from '../model/ocap/'
import { ChatBIModelModule } from '../chatbi-model'

@Module({
	imports: [
		CqrsModule,
		CopilotModule,
		SemanticModelMemberModule,
		OcapModule,
		ChatBIModelModule,
		CopilotCheckpointModule,
		CopilotKnowledgeModule
	],
	controllers: [],
	providers: [ChatBIService, ...CommandHandlers, ...provideOcap()],
	exports: []
})
export class ChatBIModule {}
