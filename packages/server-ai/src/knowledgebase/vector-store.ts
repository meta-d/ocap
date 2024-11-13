import { PGVectorStore } from '@langchain/community/vectorstores/pgvector'
import { Document } from '@langchain/core/documents'
import { Embeddings } from '@langchain/core/embeddings'
import { IKnowledgebase, IKnowledgeDocument } from '@metad/contracts'
import { Pool } from 'pg'

export class KnowledgeDocumentVectorStore extends PGVectorStore {
	private model: string | null = null

	get embeddingModel() {
		return getCopilotModel(this.knowledgebase)
	}

	constructor(
		embeddings: Embeddings,
		public knowledgebase: IKnowledgebase,
		public pgPool: Pool,
	) {
		const model = getCopilotModel(knowledgebase)
		// const embeddings = knowledgebase.copilotModel?.copilot ? createEmbeddings(knowledgebase.copilotModel?.copilot, { model }) : null

		super(embeddings, {
			pool: pgPool,
			tableName: 'knowledge_document_vector',
			collectionTableName: 'knowledge_document_collection',
			collectionName: knowledgebase.id,
			columns: {
				idColumnName: 'id',
				vectorColumnName: 'vector',
				contentColumnName: 'content',
				metadataColumnName: 'metadata'
			}
		})

		this.model = model
	}

	async getChunks(knowledgeId: string) {
		const filter = { knowledgeId }
		let collectionId: string
		if (this.collectionTableName) {
			collectionId = await this.getOrCreateCollection()
		}

		// Set parameters of dynamically generated query
		const params = collectionId ? [filter, collectionId] : [filter]

		const queryString = `
		  SELECT * FROM ${this.computedTableName}
		  WHERE ${collectionId ? 'collection_id = $2 AND ' : ''}${this.metadataColumnName}::jsonb @> $1
		`
		return (await this.pool.query(queryString, params)).rows
	}

	async addKnowledgeDocument(
		knowledgeDocument: IKnowledgeDocument,
		documents: Document<Record<string, any>>[]
	): Promise<void> {
		documents.forEach((item) => {
			item.metadata.knowledgeId = knowledgeDocument.id
			item.metadata.model = this.model
		})
		return await this.addDocuments(documents)
	}

	async deleteKnowledgeDocument(item: IKnowledgeDocument) {
		return await this.delete({ filter: { knowledgeId: item.id } })
	}

	async deleteChunk(id: string) {
		return await this.delete({ ids: [id] })
	}

	async clear() {
		return await this.delete({ filter: {} })
	}

	/**
	 * Create table for vector store if not exist
	 */
	async ensureTableInDatabase() {
		await super.ensureTableInDatabase()
		await super.ensureCollectionTableInDatabase()
	}
}

function getCopilotModel(knowledgebase: IKnowledgebase) {
	return knowledgebase.copilotModel?.model || knowledgebase.copilotModel?.copilot?.defaultModel
}
