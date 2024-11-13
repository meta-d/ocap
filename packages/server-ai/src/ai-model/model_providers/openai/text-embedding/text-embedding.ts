import { OpenAIEmbeddings } from '@langchain/openai'
import { ICopilotModel, ModelType } from '@metad/contracts'
import { getErrorMessage } from '@metad/server-common'
import { Injectable } from '@nestjs/common'
import { ModelProvider } from '../../../ai-provider'
import { TextEmbeddingModelManager } from '../../../types/text-embedding-model'
import { CredentialsValidateFailedError } from '../../errors'

@Injectable()
export class OpenAITextEmbeddingModel extends TextEmbeddingModelManager {
	constructor(readonly modelProvider: ModelProvider) {
		super(modelProvider, ModelType.TEXT_EMBEDDING)
	}

	getEmbeddingInstance(copilotModel: ICopilotModel): OpenAIEmbeddings {
		return new OpenAIEmbeddings({
				configuration: {
					baseURL: copilotModel.copilot.apiHost
				},
				apiKey: copilotModel.copilot.apiKey,
				// batchSize: 512, // Default value if omitted is 512. Max is 2048
				model: copilotModel.model || copilotModel.copilot.defaultModel
			})
	}

	async validateCredentials(model: string, credentials: Record<string, any>): Promise<void> {
		try {
			// transform credentials to kwargs for model instance
			// const credentialsKwargs = this._toCredentialKwargs(credentials);
			const embeddings = new OpenAIEmbeddings({
				configuration: {
					baseURL: credentials.apiHost
				},
				apiKey: credentials.api_key,
				// batchSize: 512, // Default value if omitted is 512. Max is 2048
				model
			})

			// call embedding model
			await embeddings.embedQuery('ping')
		} catch (ex) {
			throw new CredentialsValidateFailedError(getErrorMessage(ex))
		}
	}
}
