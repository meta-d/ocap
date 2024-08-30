import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RouterModule } from 'nest-router'
import { TenantModule } from '../tenant'
import { UserModule } from '../user'
import { CopilotModule } from '../copilot/copilot.module'
import { DatabaseModule } from '../database/database.module'
import { Knowledgebase } from './knowledgebase.entity'
import { KnowledgebaseController } from './knowledgebase.controller'
import { KnowledgebaseService } from './knowledgebase.service'
import { QueryHandlers } from './queries/handlers'
import { CommandHandlers } from './commands/handlers'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/knowledgebase', module: KnowledgebaseModule }]),
		TypeOrmModule.forFeature([ Knowledgebase ]),
		TenantModule,
		CqrsModule,
		UserModule,
		CopilotModule,
		DatabaseModule
	],
	controllers: [KnowledgebaseController],
	providers: [KnowledgebaseService, ...QueryHandlers, ...CommandHandlers],
	exports: [KnowledgebaseService]
})
export class KnowledgebaseModule {}
