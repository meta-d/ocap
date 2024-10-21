import { ConfigModule } from '@metad/server-config'
import { Injectable, Module } from '@nestjs/common'
import { PROVIDE_AI_MODEL_LLM } from '../../types/types'
import { ModelProvider } from '../../ai-provider'
import { DeepseekLargeLanguageModel } from './llm/llm'

@Injectable()
export class DeepseekProvider extends ModelProvider {
	constructor() {
		super('deepseek')
	}

	async validateProviderCredentials(credentials: Record<string, any>): Promise<void> {
		//
	}
}

@Module({
	imports: [ConfigModule],
	providers: [
		DeepseekProvider,
		{
			provide: ModelProvider,
			useExisting: DeepseekProvider
		},
		{
			provide: PROVIDE_AI_MODEL_LLM,
			useClass: DeepseekLargeLanguageModel
		}
	],
	exports: [DeepseekProvider]
})
export class DeepseekProviderModule {}
