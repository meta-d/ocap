import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { TokenTextSplitter } from '@langchain/textsplitters'
import { AiProviderRole, IKnowledgeDocument } from '@metad/contracts'
import { getErrorMessage } from '@metad/server-common'
import { JOB_REF, Process, Processor } from '@nestjs/bull'
import { Inject, Logger, Scope } from '@nestjs/common'
import { Job } from 'bull'
import { Document } from 'langchain/document'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { Pool } from 'pg'
import { CopilotService } from '../copilot'
import { FileStorage } from '../core/file-storage'
import { Provider } from '../core/file-storage/providers/provider'
import { DATABASE_POOL_TOKEN } from '../database'
import { KnowledgebaseService } from '../knowledgebase/knowledgebase.service'
import { KnowledgeDocumentService } from './document.service'
import { KnowledgeDocumentVectorStore } from './vector-store'
import { createEmbeddings } from './types'

@Processor({
	name: 'knowledge-document',
	scope: Scope.REQUEST
})
export class KnowledgeDocumentConsumer {
	private readonly logger = new Logger(KnowledgeDocumentConsumer.name)

	storageProvider: Provider<any>
	constructor(
		@Inject(JOB_REF) jobRef: Job,
		private readonly copilotService: CopilotService,
		private readonly service: KnowledgeDocumentService,
		private readonly knowledgebaseService: KnowledgebaseService,
		@Inject(DATABASE_POOL_TOKEN) private readonly pgPool: Pool
	) {}

	@Process()
	async process(job: Job<{ docs: IKnowledgeDocument[] }>) {
		let vectorStore: KnowledgeDocumentVectorStore
		try {
			const doc = job.data.docs[0]
			let copilot = await this.copilotService.findOneByRole(
				AiProviderRole.Embedding,
				doc.tenantId,
				doc.organizationId
			)
			if (!copilot?.enabled) {
				copilot = await this.copilotService.findOneByRole(
					AiProviderRole.Primary,
					doc.tenantId,
					doc.organizationId
				)
			}
			if (!copilot?.enabled) {
				throw new Error('No copilot found')
			}

			const embeddings = createEmbeddings(copilot)
			const knowledgebase = await this.knowledgebaseService.findOne(doc.knowledgebaseId)
			vectorStore = new KnowledgeDocumentVectorStore(knowledgebase, embeddings, this.pgPool)

			// Create table for vector store if not exist
			await vectorStore.ensureTableInDatabase()
		} catch (err) {
			await Promise.all(
				job.data.docs.map((doc) =>
					this.service.update(doc.id, { status: 'error', processMsg: getErrorMessage(err) })
				)
			)
			await job.moveToFailed(err)
			return
		}

		for await (const doc of job.data.docs) {
			const document = await this.service.findOne(doc.id, { relations: ['storageFile'] })

			try {
				this.storageProvider = new FileStorage()
					.setProvider(document.storageFile.storageProvider)
					.getProviderInstance()
				let data: Document<Record<string, any>>[]
				switch (document.type) {
					case 'md':
						data = await this.processMarkdown(document)
						break
					case 'pdf':
						data = await this.processPdf(document)
						break
				}

				if (data) {
					this.logger.debug(`Embeddings document '${document.storageFile.originalName}' size: ${data.length}`)
					const batchSize = 10
					let count = 0
					while (batchSize * count < data.length) {
						const batch = data.slice(batchSize * count, batchSize * (count + 1))
						await vectorStore.addKnowledgeDocument(document, batch)
						count++
						const progress = (((batchSize * count) / data.length) * 100).toFixed(1)
						this.logger.debug(
							`Embeddings document '${document.storageFile.originalName}' progress: ${progress}%`
						)
						await this.service.update(doc.id, { progress: Number(progress) })
					}
				}

				await this.service.update(doc.id, { status: 'finish', processMsg: '' })
			} catch (err) {
				this.service.update(document.id, {
					status: 'error',
					processMsg: getErrorMessage(err)
				})
				await job.moveToFailed(err)
			}
		}

		return {}
	}

	async processMarkdown(document: IKnowledgeDocument): Promise<Document<Record<string, any>>[]> {
		const fileBuffer = await this.storageProvider.getFile(document.storageFile.file)

		const loader = new TextLoader(new Blob([fileBuffer], { type: 'text/plain' }))
		const data = await loader.load()

		const textSplitter = new TokenTextSplitter({
			chunkSize: document.parserConfig.chunkSize ?? 100,
			chunkOverlap: document.parserConfig.chunkOverlap ?? 0
		})

		const splitDocs = await textSplitter.splitDocuments(data)
		return splitDocs
	}

	async processPdf(document: IKnowledgeDocument): Promise<Document<Record<string, any>>[]> {
		const fileBuffer = await this.storageProvider.getFile(document.storageFile.file)
		const loader = new PDFLoader(new Blob([fileBuffer], { type: 'pdf' }))
		const data = await loader.load()
		return data
	}
}
