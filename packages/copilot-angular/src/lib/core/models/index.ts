import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessage } from '@langchain/core/messages'
import { ChatOpenAI, ClientOptions } from '@langchain/openai'
import { AiProvider, ICopilot } from '@metad/copilot'
import { NgmChatOllama } from './chat-ollama'

export function createLLM<T = BaseChatModel>(
  copilot: ICopilot,
  clientOptions: ClientOptions,
  tokenRecord: (input: { copilot: ICopilot; tokenUsed: number }) => void
): T {
  switch (copilot?.provider) {
    case AiProvider.OpenAI:
    case AiProvider.Azure:
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
              let tokenUsed = 0
              output.generations?.forEach((generation) => {
                generation.forEach((item) => {
                  tokenUsed += (<AIMessage>(item as any).message).usage_metadata.total_tokens
                })
              })
              tokenRecord({ copilot, tokenUsed })
            }
          }
        ]
      }) as T
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
              let tokenUsed = 0
              output.generations?.forEach((generation) => {
                generation.forEach((item) => {
                  tokenUsed += (<AIMessage>(item as any).message).usage_metadata.total_tokens
                })
              })
              tokenRecord({ copilot, tokenUsed })
            }
          }
        ]
      }) as T
    default:
      return null
  }
}
