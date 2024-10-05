import { ChatModule, CopilotCheckpointModule, CopilotKnowledgeModule, CopilotModule } from '@metad/server-ai'
import { CacheModule, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ChatBIModelModule } from '../chatbi-model'
import { SemanticModelMemberModule } from '../model-member/index'
import { OcapModule } from '../model/ocap'
import { provideOcap } from '../model/ocap/'
import { ChatBIService } from './chatbi.service'
import { CommandHandlers } from './commands/handlers'

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
