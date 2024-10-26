import { ChatOpenAI } from '@langchain/openai'
import { ICopilotModel, ModelType } from '@metad/contracts'
import { sumTokenUsage } from '@metad/copilot'
import { Injectable } from '@nestjs/common'
import { AIModel } from '../../../ai-model'
import { ModelProvider } from '../../../ai-provider'
import { AIModelEntity } from '../../../entities'
import { TChatModelOptions } from '../../../types/types'

@Injectable()
export class DeepseekLargeLanguageModel extends AIModel {
	constructor(readonly modelProvider: ModelProvider) {
		super(modelProvider, ModelType.LLM)
	}

	validateCredentials(model: string, credentials: Record<string, any>): Promise<void> {
		throw new Error('Method not implemented.')
	}
	protected getCustomizableModelSchemaFromCredentials(
		model: string,
		credentials: Record<string, any>
	): Promise<AIModelEntity | null> {
		throw new Error('Method not implemented.')
	}

	getChatModel(copilotModel: ICopilotModel, options?: TChatModelOptions) {
		const { copilot } = copilotModel
		const { handleLLMTokens } = options ?? {}
		return new ChatOpenAI({
			apiKey: copilot.apiKey,
			configuration: {
				baseURL: copilot.apiHost || 'https://api.deepseek.com/v1'
			},
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
