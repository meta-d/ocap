import { Embeddings } from '@langchain/core/embeddings'
import { AIModel } from '../ai-model'
import { ICopilotModel } from '@metad/contracts'

export abstract class TextEmbeddingModelManager extends AIModel {
	abstract getEmbeddingInstance(copilotModel: ICopilotModel): Embeddings
}
