import { Injectable, Module } from '@nestjs/common'
import { ModelProvider } from '../../ai-provider'

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
		}
	],
	exports: [ModelProvider]
})
export class OllamaProviderModule {}
