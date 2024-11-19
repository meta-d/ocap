import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { RouterModule } from 'nest-router'
import { AIProvidersService } from './ai-model.service'
import { AnthropicProviderModule } from './model_providers/anthropic/anthropic'
import { DeepseekProviderModule } from './model_providers/deepseek/deepseek'
import { OllamaProviderModule } from './model_providers/ollama/ollama'
import { OpenAIProviderModule } from './model_providers/openai/openai'
import { QueryHandlers } from './queries/handlers'
import { AIModelController } from './ai-model.controller'
import { CommandHandlers } from './commands/handlers'

@Module({
	imports: [
		RouterModule.forRoutes([{ path: '/ai-model', module: AIModelModule }]),
		CqrsModule,
		OpenAIProviderModule,
		OllamaProviderModule,
		DeepseekProviderModule,
		AnthropicProviderModule
	],
	controllers: [ AIModelController ],
	providers: [AIProvidersService, ...QueryHandlers, ...CommandHandlers],
	exports: [AIProvidersService]
})
export class AIModelModule {}
