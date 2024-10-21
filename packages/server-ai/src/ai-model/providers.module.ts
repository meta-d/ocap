import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { OllamaProviderModule } from './model_providers/ollama/ollama'
import { OpenAIProviderModule } from './model_providers/openai/openai'
import { AIProvidersService } from './providers.service'
import { QueryHandlers } from './queries/handlers'
import { DeepseekProviderModule } from './model_providers/deepseek/deepseek'

@Module({
	imports: [CqrsModule, OpenAIProviderModule, OllamaProviderModule, DeepseekProviderModule],
	providers: [AIProvidersService, ...QueryHandlers],
	exports: [AIProvidersService]
})
export class AIProvidersModule {}
