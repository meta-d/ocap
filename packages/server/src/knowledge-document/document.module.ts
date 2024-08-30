import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bull'
import { RouterModule } from 'nest-router'
import { TenantModule } from '../tenant'
import { UserModule } from '../user'
import { KnowledgeDocumentController } from './document.controller'
import { KnowledgeDocument } from './document.entity'
import { KnowledgeDocumentService } from './document.service'
import { KnowledgeDocumentConsumer } from './document.job'
import { StorageFileModule } from '../storage-file'
import { CopilotModule } from '../copilot'
import { KnowledgebaseModule } from '../knowledgebase/knowledgebase.module'
import { QueryHandlers } from './queries/handlers'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/knowledge-document', module: KnowledgeDocumentModule }]),
		TypeOrmModule.forFeature([KnowledgeDocument]),
		TenantModule,
		CqrsModule,
		UserModule,
		StorageFileModule,
		CopilotModule,
		KnowledgebaseModule,

		BullModule.registerQueue({
			name: 'knowledge-document',
		  })
	],
	controllers: [KnowledgeDocumentController],
	providers: [KnowledgeDocumentService, KnowledgeDocumentConsumer, ...QueryHandlers],
	exports: [KnowledgeDocumentService]
})
export class KnowledgeDocumentModule {}
