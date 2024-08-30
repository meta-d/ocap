import { IKnowledgeDocument } from '@metad/contracts'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TenantOrganizationAwareCrudService } from '../core/crud'
import { StorageFileService } from '../storage-file'
import { KnowledgeDocument } from './document.entity'
import { DATABASE_POOL_TOKEN } from '../database'
import { Pool } from 'pg'
import { KnowledgeDocumentVectorStore } from './vector-store'

@Injectable()
export class KnowledgeDocumentService extends TenantOrganizationAwareCrudService<KnowledgeDocument> {
	readonly #logger = new Logger(KnowledgeDocumentService.name)

	constructor(
		@InjectRepository(KnowledgeDocument)
		repository: Repository<KnowledgeDocument>,
		private readonly storageFileService: StorageFileService,
		@Inject(DATABASE_POOL_TOKEN) private readonly pgPool: Pool
	) {
		super(repository)
	}

	async createDocument(document: Partial<IKnowledgeDocument>): Promise<KnowledgeDocument> {
		const storageFile = await this.storageFileService.findOne(document.storageFileId)
		const fileType = storageFile.originalName.split('.').pop()
		return await this.create({
			...document,
			type: document.type ?? fileType
		})
	}

	async createBulk(documents: Partial<IKnowledgeDocument>[]): Promise<KnowledgeDocument[]> {
		return await Promise.all(documents.map((document) => this.createDocument(document)))
	}

	async save(document: KnowledgeDocument | KnowledgeDocument[]): Promise<KnowledgeDocument | KnowledgeDocument[]> {
		return Array.isArray(document)
			? await Promise.all(document.map((d) => this.repository.save(d)))
			: await this.repository.save(document)
	}

	async getChunks(id: string) {
		const document = await this.findOne(id, { relations: ['knowledgebase'] })
		const vectorStore = new KnowledgeDocumentVectorStore(document.knowledgebase, null, this.pgPool)
		return await vectorStore.getChunks(id)
	}

	async deleteChunk(documentId: string, id: string) {
		const document = await this.findOne(documentId, { relations: ['knowledgebase'] })
		const vectorStore = new KnowledgeDocumentVectorStore(document.knowledgebase, null, this.pgPool)
		return await vectorStore.deleteChunk(id)
	}
}
