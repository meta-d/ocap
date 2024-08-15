import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CopilotCheckpointModule, CopilotModule } from '@metad/server-core'
import { CommandHandlers } from './commands/handlers'
import { ChatBIService } from './chatbi.service'
import { SemanticModelMemberModule } from '../model-member/index'
import { OcapModule } from '../model/ocap'
import { SemanticModelModule } from '../model'
import { provideOcap } from '../model/ocap/'

@Module({
	imports: [
		CqrsModule,
		CopilotModule,
		SemanticModelMemberModule,
		OcapModule,
		SemanticModelModule,
		CopilotCheckpointModule
	],
	controllers: [],
	providers: [ChatBIService, ...CommandHandlers, ...provideOcap()],
	exports: []
})
export class ChatBIModule {}
