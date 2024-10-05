import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bull'
import { RouterModule } from 'nest-router'
import { StorageFileModule, TenantModule, UserModule } from '@metad/server-core'
import { KnowledgeDocumentController } from './document.controller'
import { KnowledgeDocument } from './document.entity'
import { KnowledgeDocumentService } from './document.service'
import { KnowledgeDocumentConsumer } from './document.job'
import { CopilotModule } from '../copilot'
import { KnowledgebaseModule } from '../knowledgebase/knowledgebase.module'

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
			name: 'embedding-document',
		  })
	],
	controllers: [KnowledgeDocumentController],
	providers: [KnowledgeDocumentService, KnowledgeDocumentConsumer ],
	exports: [KnowledgeDocumentService]
})
export class KnowledgeDocumentModule {}
