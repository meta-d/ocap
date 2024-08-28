import { AiProvider } from './ai.model'
import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model'
import { IStorageFile } from './storage-file.model'

/**
 * Knowledgebase
 */
export interface IKnowledgebase extends IBasePerTenantAndOrganizationEntityModel {
  /**
   * KB name
   */
  name: string
  /**
   * English | Chinese
   */
  language?: 'Chinese' | 'English' | null
  /**
   * avatar base64 string
   */
  avatar?: string
  /**
   * KB description
   */
  description?: string

  aiProvider?: AiProvider
  /**
   * default embedding model ID
   */
  embeddingModelId?: string

  documentNum?: number | null
  tokenNum?: number | null
  chunkNum?: number | null
  /**
   *
   */
  similarityThreshold: number
  vectorSimilarityWeight: number
  /**
   * default parser ID
   */
  parserId: string

  parserConfig: {
    pages: number[][]
  }

  status: string
}

export type DocumentParserConfig = {
  pages?: number[][]
  delimiter: string
  chunkSize: number | null
  chunkOverlap: number | null
}

export interface IKnowledgeDocument extends IBasePerTenantAndOrganizationEntityModel {
  knowledgebaseId?: string
  knowledgebase?: IKnowledgebase

  storageFileId?: string
  storageFile?: IStorageFile

  /**
   * thumbnail base64 string
   */
  thumbnail?: string

  /**
   * default parser ID
   */
  parserId: string
  parserConfig: DocumentParserConfig
  /**
   * where dose this document come from
   */
  sourceType?: 'local' | 'url' | null
  /**
   * file extension
   */
  type: string
  /**
   * file name
   */
  name: string
  /**
   * where dose it store
   */
  location: string

  size: string

  tokenNum?: number | null
  chunkNum?: number | null

  progress?: number | null
  /**
   * process message
   */
  processMsg?: string | null

  processBeginAt?: Date | null

  processDuation?: number | null

  /**
   * is it validate (0: wasted，1: validate)
   */
  status?: 'wasted' | 'validate' | 'running' | 'cancel' | 'finish' | 'error'
  /**
   * The background job id
   */
  jobId?: string
}
