// 同步与：`@metad/server-ai`/copilot/llm.ts
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { ChatOpenAI, ClientOptions } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { AI_PROVIDERS, AiProtocol, AiProvider, ICopilot, sumTokenUsage } from '@metad/copilot'
import { NgmChatOllama } from './chat-ollama'

export function createLLM<T = BaseChatModel>(
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
							tokenUsed: output.llmOutput?.['totalTokens'] ?? sumTokenUsage(output)
						})
          }
        }
      ]
    }) as T
  }
  switch (copilot?.provider) {
    case AiProvider.Ollama:
      return new NgmChatOllama({
        baseUrl: copilot.apiHost || null,
        model: copilot.defaultModel,
        headers: {
          ...(clientOptions?.defaultHeaders ?? {})
        },
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
                tokenUsed: output.llmOutput?.['totalTokens'] ?? sumTokenUsage(output)
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
