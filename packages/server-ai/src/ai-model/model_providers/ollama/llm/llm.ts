import { ChatOllama } from '@langchain/ollama'
import { AIModelEntity, AiModelTypeEnum, ICopilotModel } from '@metad/contracts'
import { sumTokenUsage } from '@metad/copilot'
import { getErrorMessage } from '@metad/server-common'
import { Injectable } from '@nestjs/common'
import { AIModel } from '../../../ai-model'
import { ModelProvider } from '../../../ai-provider'
import { TChatModelOptions } from '../../../types/types'
import { CredentialsValidateFailedError } from '../../errors'
import { OllamaCredentials } from '../types'

@Injectable()
export class OllamaLargeLanguageModel extends AIModel {
	constructor(readonly modelProvider: ModelProvider) {
		super(modelProvider, AiModelTypeEnum.LLM)
	}

	async validateCredentials(model: string, credentials: OllamaCredentials): Promise<void> {
		const chatModel = new ChatOllama({
			baseUrl: credentials.base_url,
			model: model,
			temperature: 0,
			maxRetries: 2
			// other params...
		})
		try {
			await chatModel.invoke([
				{
					role: 'human',
					content: `Hi`
				}
			])
		} catch (err) {
			throw new CredentialsValidateFailedError(getErrorMessage(err))
		}
	}

	protected getCustomizableModelSchemaFromCredentials(
		model: string,
		credentials: Record<string, any>
	): AIModelEntity | null {
		throw new Error('Method not implemented.')
	}

	override getChatModel(copilotModel: ICopilotModel, options?: TChatModelOptions) {
		const { copilot } = copilotModel
		const modelProperties = options.modelProperties as OllamaCredentials

		const { handleLLMTokens } = options ?? {}
		return new ChatOllama({
			baseUrl: modelProperties.base_url,
			model: copilotModel.model || copilot.defaultModel,
			temperature: 0,
			callbacks: [
				{
					handleLLMEnd(output) {
						if (handleLLMTokens) {
							handleLLMTokens({
								copilot,
								tokenUsed: output.llmOutput?.totalTokens ?? sumTokenUsage(output)
							})
						}
					}
				}
			]
		})
	}
}
