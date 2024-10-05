import { UserModule } from '@metad/server-core'
import { Module, forwardRef } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { AIModule } from './ai'
import { ChatModule } from './chat'
import { ChatConversationModule } from './chat-conversation'
import { CopilotModule } from './copilot'
import { CopilotCheckpointModule } from './copilot-checkpoint'
import { CopilotKnowledgeModule } from './copilot-knowledge'
import { CopilotOrganizationModule } from './copilot-organization'
import { CopilotUserModule } from './copilot-user'
import { EventHandlers } from './core/events'
import { GraphragModule } from './graphrag/graphrag.module'
import { KnowledgeDocumentModule } from './knowledge-document/document.module'
import { KnowledgebaseModule } from './knowledgebase'
import { XpertRoleModule } from './xpert-role'

@Module({
	imports: [
		forwardRef(() => CqrsModule),
		forwardRef(() => UserModule),
		KnowledgebaseModule,
		KnowledgeDocumentModule,
		ChatModule,
		ChatConversationModule,
		CopilotCheckpointModule,
		AIModule,
		CopilotModule,
		CopilotKnowledgeModule,
		CopilotUserModule,
		CopilotOrganizationModule,
		GraphragModule,
		XpertRoleModule
	],
	controllers: [],
	providers: [...EventHandlers]
})
export class ServerAIModule {}
