import { Module } from '@nestjs/common'
import { OllamaProviderModule } from './model_providers/ollama/ollama'
import { OpenAIProviderModule } from './model_providers/openai/openai'
import { AIProvidersService } from './providers.service'

@Module({
	imports: [OpenAIProviderModule, OllamaProviderModule],
	providers: [AIProvidersService],
	exports: [AIProvidersService]
})
export class AIProvidersModule {}
