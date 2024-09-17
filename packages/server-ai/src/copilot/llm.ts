import { Embeddings } from '@langchain/core/embeddings'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessage } from '@langchain/core/messages'
import { ChatGenerationChunk } from '@langchain/core/outputs'
import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama'
import { ChatOpenAI, ClientOptions, OpenAIEmbeddings } from '@langchain/openai'
import { ICopilot, OllamaEmbeddingsProviders, OpenAIEmbeddingsProviders } from '@metad/contracts'
import { AI_PROVIDERS, AiProtocol, AiProvider } from '@metad/copilot'
import { ChatAnthropic } from "@langchain/anthropic"

export function createLLM<T = ChatOpenAI | BaseChatModel>(
	copilot: ICopilot,
	clientOptions: ClientOptions,
	tokenRecord: (input: { copilot: ICopilot; tokenUsed: number }) => void
): T {
	if (AI_PROVIDERS[copilot?.provider]?.protocol === AiProtocol.OpenAI) {
		return new ChatOpenAI({
			apiKey: copilot.apiKey,
			configuration: {
				baseURL: copilot.apiHost || null,
				...(clientOptions ?? {})
			},
			model: copilot.defaultModel,
			temperature: 0,
			callbacks: [
				{
					handleLLMEnd(output) {
						tokenRecord({ copilot, tokenUsed: output.llmOutput?.totalTokens ?? calculateTokenUsage(output) })
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
							tokenRecord({ copilot, tokenUsed: calculateTokenUsage(output) })
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
							tokenRecord({ copilot, tokenUsed: output.llmOutput?.totalTokens ?? calculateTokenUsage(output) })
						}
					}
				]
			}) as T
		}
		default:
			return null
	}
}

function calculateTokenUsage(output) {
	let tokenUsed = 0
	output.generations?.forEach((generation) => {
		generation.forEach((item) => {
			tokenUsed += (<AIMessage>(<ChatGenerationChunk>item).message).usage_metadata.total_tokens
		})
	})
	return tokenUsed
}

export function createEmbeddings(
	copilot: ICopilot,
	options?: {model: string},
	tokenRecord?: (input: { copilot: ICopilot; tokenUsed: number }) => void
): Embeddings {
	const { model } = options ?? {}
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
	}

	throw new Error(`Unimplemented copilot provider '${copilot.provider}' for embeddings`)
}
