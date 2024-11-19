import { Injectable, Module } from '@nestjs/common'
import { ModelProvider } from '../../ai-provider'
import { OllamaLargeLanguageModel } from './llm/llm'
import { OllamaTextEmbeddingModel } from './text-embedding/text-embedding'

@Injectable()
export class OllamaProvider extends ModelProvider {
	constructor() {
		super('ollama')
	}

	async validateProviderCredentials(credentials: Record<string, any>): Promise<void> {
		return
	}
}

@Module({
	providers: [
		OllamaProvider,
		{
			provide: ModelProvider,
			useExisting: OllamaProvider
		},
		OllamaLargeLanguageModel,
		OllamaTextEmbeddingModel
	],
	exports: [ModelProvider]
})
export class OllamaProviderModule {}
