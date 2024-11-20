export * from './errors'

import { OpenAIProviderModule } from './openai/openai'
import { OllamaProviderModule } from './ollama/ollama'
import { DeepseekProviderModule } from './deepseek/deepseek'
import { AnthropicProviderModule } from './anthropic/anthropic'
import { BaichuanProviderModule } from './baichuan/baichuan'
import { AzureAIStudioProviderModule } from './azure_ai_studio/azure_ai_studio'

export const ProviderModules = [
    OpenAIProviderModule,
    OllamaProviderModule,
    DeepseekProviderModule,
    AnthropicProviderModule,
    BaichuanProviderModule,
    AzureAIStudioProviderModule
]