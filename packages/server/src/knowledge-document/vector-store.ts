import { PGVectorStore } from '@langchain/community/vectorstores/pgvector'
import { Document } from '@langchain/core/documents'
import { EmbeddingsInterface } from '@langchain/core/embeddings'
import { IKnowledgebase, IKnowledgeDocument } from '@metad/contracts'
import { Pool } from 'pg'

export class KnowledgeDocumentVectorStore {
	vectorStore: PGVectorStore

	constructor(
		public knowledgebase: IKnowledgebase,
		public embeddings: EmbeddingsInterface,
		public pgPool: Pool
	) {
		this.vectorStore = new PGVectorStore(embeddings, {
			pool: this.pgPool,
			tableName: 'knowledge_document_vector',
			collectionTableName: 'knowledge_document_collection',
			collectionName: this.knowledgebase.id,
			columns: {
				idColumnName: 'id',
				vectorColumnName: 'vector',
				contentColumnName: 'content',
				metadataColumnName: 'metadata'
			}
		})
	}

	async addKnowledgeDocument(knowledgeDocument: IKnowledgeDocument, documents: Document<Record<string, any>>[]): Promise<void> {
		documents.forEach((item) => {
			item.metadata.knowledgeId = knowledgeDocument.id
		})
		return await this.vectorStore.addDocuments(documents)
	}

	async addKnowledgeDocuments(KnowledgeDocuments: IKnowledgeDocument[]): Promise<void> {
		if (!KnowledgeDocuments.length) return

		const documents = KnowledgeDocuments.map(
			(example) =>
				new Document({
					metadata: {
						id: example.id
					},
					pageContent: ''
				})
		)

		return await this.vectorStore.addDocuments(documents, {
			ids: KnowledgeDocuments.map((example) => example.id)
		})
	}

	async updateKnowledgeDocuments(KnowledgeDocuments: IKnowledgeDocument[]): Promise<void> {
		// Delete old example vectors
		await this.vectorStore.delete({ ids: KnowledgeDocuments.map((example) => example.id) })

		// Add new example vectors
		await this.addKnowledgeDocuments(KnowledgeDocuments)
	}

	async deleteIKnowledgeDocument(item: IKnowledgeDocument) {
		return await this.vectorStore.delete({ ids: [item.id] })
	}

	async clear() {
		return await this.vectorStore.delete({ filter: {} })
	}

	/**
	 * Create table for vector store if not exist
	 */
	async ensureTableInDatabase() {
		await this.vectorStore.ensureTableInDatabase()
		await this.vectorStore.ensureCollectionTableInDatabase()
	}
}
