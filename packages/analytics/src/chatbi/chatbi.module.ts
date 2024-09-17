import { CacheModule, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ChatModule, CopilotCheckpointModule, CopilotKnowledgeModule, CopilotModule } from '@metad/server-ai'
import { CommandHandlers } from './commands/handlers'
import { ChatBIService } from './chatbi.service'
import { SemanticModelMemberModule } from '../model-member/index'
import { OcapModule } from '../model/ocap'
import { provideOcap } from '../model/ocap/'
import { ChatBIModelModule } from '../chatbi-model'

@Module({
	imports: [
		CacheModule.register(),
		CqrsModule,
		CopilotModule,
		SemanticModelMemberModule,
		OcapModule,
		ChatBIModelModule,
		CopilotCheckpointModule,
		CopilotKnowledgeModule,
		ChatModule
	],
	controllers: [],
	providers: [ChatBIService, ...CommandHandlers, ...provideOcap()],
	exports: []
})
export class ChatBIModule {}
