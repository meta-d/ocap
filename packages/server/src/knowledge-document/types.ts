import { OllamaEmbeddings } from '@langchain/ollama'
import { OpenAIEmbeddings } from '@langchain/openai'
import { AiProvider, ICopilot } from '@metad/contracts'

export function createEmbeddings(copilot: ICopilot) {
	switch (copilot.provider) {
		case AiProvider.OpenAI:
		case AiProvider.Azure:
			return new OpenAIEmbeddings({
				verbose: true,
				apiKey: copilot.apiKey,
				model: copilot.defaultModel,
				configuration: {
					baseURL: copilot.apiHost
				}
			})
		case AiProvider.Ollama:
			return new OllamaEmbeddings({
				baseUrl: copilot.apiHost,
				model: copilot.defaultModel
			})
		default:
			throw new Error(`Unimplemented copilot provider '${copilot.provider}' for embeddings`)
	}
}
