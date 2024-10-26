import { ChatAnthropic } from '@langchain/anthropic'
import { ICopilotModel, ModelType } from '@metad/contracts'
import { Injectable } from '@nestjs/common'
import { AIModel } from '../../../ai-model'
import { ModelProvider } from '../../../ai-provider'
import { AIModelEntity } from '../../../entities'
import { TChatModelOptions } from '../../../types/types'

@Injectable()
export class AnthropicLargeLanguageModel extends AIModel {
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

		const model = copilotModel?.model || copilotModel?.referencedModel?.model || copilot.defaultModel
		return new ChatAnthropic({
			anthropicApiUrl: copilot.apiHost || null,
			apiKey: copilot.apiKey,
			model,
			temperature: 0,
			maxTokens: undefined,
			maxRetries: 2,
			callbacks: [
				{
					handleLLMEnd(output) {
						// tokenRecord({
						//     copilot,
						//     tokenUsed: output.llmOutput?.totalTokens ?? sumTokenUsage(output)
						// })
					}
				}
			]
		})
	}
}
