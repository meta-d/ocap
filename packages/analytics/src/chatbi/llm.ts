// import { BaseChatModel } from '@langchain/core/language_models/chat_models'
// import { AIMessage } from '@langchain/core/messages'
// import { ChatOllama } from '@langchain/ollama'
// import { ChatOpenAI, ClientOptions } from '@langchain/openai'
// import { AiProviderRole, ICopilot } from '@metad/contracts'
// import { AiProvider } from '@metad/copilot'

// export function createLLM<T = ChatOpenAI | BaseChatModel>(
// 	copilot: ICopilot,
// 	clientOptions: ClientOptions,
// 	tokenRecord: (input: { copilot: ICopilot; tokenUsed: number }) => void
// ): T {
// 	switch (copilot?.provider) {
// 		case AiProvider.OpenAI:
// 		case AiProvider.Azure:
// 			return new ChatOpenAI({
// 				apiKey: copilot.apiKey,
// 				configuration: {
// 					baseURL: copilot.apiHost || null,
// 					...(clientOptions ?? {})
// 				},
// 				model: copilot.defaultModel,
// 				temperature: 0,
// 				callbacks: [
// 					{
// 						handleLLMEnd(output) {
// 							// console.log(output.llmOutput?.totalTokens)
// 							// let tokenUsed = 0
// 							// output.generations?.forEach((generation) => {
// 							// 	generation.forEach((item) => {
// 							// 		tokenUsed += (<AIMessage>(item as any).message).usage_metadata?.total_tokens ?? 0
// 							// 	})
// 							// })
// 							tokenRecord({ copilot, tokenUsed: output.llmOutput?.totalTokens ?? 0 })
// 						}
// 					}
// 				]
// 			}) as T
// 		case AiProvider.Ollama:
// 			return new ChatOllama({
// 				baseUrl: copilot.apiHost || null,
// 				model: copilot.defaultModel,
// 				callbacks: [
// 					{
// 						handleLLMEnd(output) {
// 							let tokenUsed = 0
// 							output.generations?.forEach((generation) => {
// 								generation.forEach((item) => {
// 									tokenUsed += (<AIMessage>(item as any).message).usage_metadata.total_tokens
// 								})
// 							})
// 							tokenRecord({ copilot, tokenUsed })
// 						}
// 					}
// 				]
// 			}) as T
// 		default:
// 			return null
// 	}
// }