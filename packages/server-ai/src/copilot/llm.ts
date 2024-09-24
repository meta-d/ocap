import { ChatAnthropic } from '@langchain/anthropic'
import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi'
import { Embeddings } from '@langchain/core/embeddings'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama'
import { ChatOpenAI, ClientOptions, OpenAIEmbeddings } from '@langchain/openai'
import { ICopilot, OllamaEmbeddingsProviders, OpenAIEmbeddingsProviders } from '@metad/contracts'
import { AI_PROVIDERS, AiProtocol, AiProvider, sumTokenUsage } from '@metad/copilot'

export function createLLM<T = ChatOpenAI | BaseChatModel>(
	copilot: ICopilot,
	clientOptions: ClientOptions,
	tokenRecord: (input: { copilot: ICopilot; tokenUsed: number }) => void
): T {
	if (AI_PROVIDERS[copilot?.provider]?.protocol === AiProtocol.OpenAI) {
		return new ChatOpenAI({
			apiKey: copilot.apiKey,
			configuration: {
				baseURL: copilot.apiHost || AI_PROVIDERS[copilot.provider]?.apiHost || null,
				...(clientOptions ?? {})
			},
			model: copilot.defaultModel,
			temperature: 0,
			callbacks: [
				{
					handleLLMEnd(output) {
						tokenRecord({
							copilot,
							tokenUsed: output.llmOutput?.totalTokens ?? sumTokenUsage(output)
						})
					}
				}
			]
		}) as T
	}
	switch (copilot?.provider) {
		case AiProvider.Ollama:
			return new ChatOllama({
				baseUrl: copilot.apiHost || null,
				model: copilot.defaultModel,
				callbacks: [
					{
						handleLLMEnd(output) {
							tokenRecord({ copilot, tokenUsed: sumTokenUsage(output) })
						}
					}
				]
			}) as T
		case AiProvider.Anthropic: {
			return new ChatAnthropic({
				anthropicApiUrl: copilot.apiHost || null,
				apiKey: copilot.apiKey,
				model: copilot.defaultModel,
				temperature: 0,
				maxTokens: undefined,
				maxRetries: 2,
				callbacks: [
					{
						handleLLMEnd(output) {
							tokenRecord({
								copilot,
								tokenUsed: output.llmOutput?.totalTokens ?? sumTokenUsage(output)
							})
						}
					}
				]
			}) as T
		}
		default:
			return null
	}
}



export function createEmbeddings(
	copilot: ICopilot,
	options?: { model: string; batchSize?: number },
	tokenRecord?: (input: { copilot: ICopilot; tokenUsed: number }) => void
): Embeddings {
	const { model, batchSize } = options ?? {}
	if (OpenAIEmbeddingsProviders.includes(copilot.provider)) {
		return new OpenAIEmbeddings({
			verbose: true,
			apiKey: copilot.apiKey,
			model: model ?? copilot.defaultModel,
			configuration: {
				baseURL: copilot.apiHost
			}
		})
	} else if (OllamaEmbeddingsProviders.includes(copilot.provider)) {
		return new OllamaEmbeddings({
			baseUrl: copilot.apiHost,
			model: model ?? copilot.defaultModel
		})
	} else {
		switch (copilot.provider) {
			case AiProvider.AlibabaTongyi:
				return new AlibabaTongyiEmbeddings({
					apiKey: copilot.apiKey,
					batchSize: batchSize || 25,
				})
			default:
				throw new Error(`Unimplemented copilot provider '${copilot.provider}' for embeddings`)
		}
	}
}
