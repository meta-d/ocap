import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { AnthropicProviderModule } from './model_providers/anthropic/anthropic'
import { DeepseekProviderModule } from './model_providers/deepseek/deepseek'
import { OllamaProviderModule } from './model_providers/ollama/ollama'
import { OpenAIProviderModule } from './model_providers/openai/openai'
import { AIProvidersService } from './providers.service'
import { QueryHandlers } from './queries/handlers'

@Module({
	imports: [CqrsModule, OpenAIProviderModule, OllamaProviderModule, DeepseekProviderModule, AnthropicProviderModule],
	providers: [AIProvidersService, ...QueryHandlers],
	exports: [AIProvidersService]
})
export class AIProvidersModule {}
