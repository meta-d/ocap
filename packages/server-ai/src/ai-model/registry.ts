import { ModelProvider } from './ai-provider'

export class AIProviderRegistry {
	private static instance: AIProviderRegistry
	private providers: Map<string, ModelProvider> = new Map()

	private constructor() {}

	static getInstance(): AIProviderRegistry {
		if (!AIProviderRegistry.instance) {
			AIProviderRegistry.instance = new AIProviderRegistry()
		}
		return AIProviderRegistry.instance
	}

	registerProvider(provider: ModelProvider) {
		if (this.getProvider(provider.name.toLowerCase())) {
			throw new Error(`Provider '${provider.name}' already exist!`)
		}

		this.providers.set(provider.name.toLowerCase(), provider)
	}

	getProvider(name: string): ModelProvider | undefined {
		return this.providers.get(name.toLowerCase())
	}

	getAllProviders(): ModelProvider[] {
		return Array.from(this.providers.values())
	}
}
