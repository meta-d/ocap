import { ChatOpenAI } from '@langchain/openai'
import { ICopilot, ModelType } from '@metad/contracts'
import { Injectable } from '@nestjs/common'
import { AIModel } from '../../../ai-model'
import { ModelProvider } from '../../../ai-provider'
import { AIModelEntity } from '../../../entities'

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

	getChatModel(copilot: ICopilot) {
		return new ChatOpenAI({
			apiKey: copilot.apiKey,
			configuration: {
				baseURL: copilot.apiHost || 'https://api.deepseek.com/v1',
			},
			model: copilot.defaultModel,
			temperature: 0,
			callbacks: [
				{
					handleLLMEnd(output) {
						// tokenRecord({
						// 	copilot,
						// 	tokenUsed: output.llmOutput?.totalTokens ?? sumTokenUsage(output)
						// })
					}
				}
			]
		})
	}
}
