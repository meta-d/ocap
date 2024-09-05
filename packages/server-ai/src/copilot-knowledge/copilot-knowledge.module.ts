import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { DatabaseModule, TenantModule, UserModule } from '@metad/server-core'
import { CopilotKnowledge } from './copilot-knowledge.entity'
import { CopilotKnowledgeService } from './copilot-knowledge.service'
import { CopilotKnowledgeController } from './copilot-knowledge.controller'
import { CopilotModule } from '../copilot/copilot.module'
import { CommandHandlers } from './commands/handlers'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/copilot-knowledge', module: CopilotKnowledgeModule }]),
		TypeOrmModule.forFeature([ CopilotKnowledge ]),
		TenantModule,
		CqrsModule,
		UserModule,
		CopilotModule,
		DatabaseModule
	],
	controllers: [CopilotKnowledgeController],
	providers: [CopilotKnowledgeService, ...CommandHandlers],
	exports: [CopilotKnowledgeService]
})
export class CopilotKnowledgeModule {}
