import { Test, TestingModule } from '@nestjs/testing'
import { AIProvidersModule } from './providers.module'
import { AIProvidersService } from './providers.service'
import { OpenAIProvider } from './model_providers/openai/openai'
import { ModelType } from './entities'
import { OpenAILargeLanguageModel } from './model_providers/openai/llm/llm'

describe('AIProviderModule', () => {
	let provider: AIProvidersService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
			imports: [AIProvidersModule],
			providers: []
		}).compile()

		provider = module.get<AIProvidersService>(AIProvidersService)
    })

	beforeEach(async () => {
		//
	})

	it('should be defined', () => {
		expect(provider).toBeDefined()
	})

	it('should get OpenAIProvider instance', async () => {
		const modelInstance = provider.getProvider('openai')
		expect(modelInstance).toBeInstanceOf(OpenAIProvider)
	})

    it('should get OpenAILargeLanguageModel instance', async () => {
		const modelInstance = provider.getProvider('openai')
        const llmModel = modelInstance.getModelManager(ModelType.LLM)
		expect(llmModel).toBeInstanceOf(OpenAILargeLanguageModel)
	})

	it('should get model predefinedModels', async () => {
		const modelInstance = provider.getProvider('openai')
        const llmModel = modelInstance.getModelManager(ModelType.LLM)
		const models = llmModel.predefinedModels()
		console.log(models)
		expect(models).not.toBeNull()
	})
})
