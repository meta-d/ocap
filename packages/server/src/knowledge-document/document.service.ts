import { IKnowledgeDocument } from '@metad/contracts'
import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TenantOrganizationAwareCrudService } from '../core/crud'
import { StorageFileService } from '../storage-file'
import { KnowledgeDocument } from './document.entity'

@Injectable()
export class KnowledgeDocumentService extends TenantOrganizationAwareCrudService<KnowledgeDocument> {
	readonly #logger = new Logger(KnowledgeDocumentService.name)

	constructor(
		@InjectRepository(KnowledgeDocument)
		repository: Repository<KnowledgeDocument>,
		private readonly storageFileService: StorageFileService
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
}
