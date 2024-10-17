import { Injectable } from '@nestjs/common'
import { ModelProvider } from './ai-provider'
import { AIProviderRegistry } from './registry'

@Injectable()
export class AIProvidersService {
	private registry = AIProviderRegistry.getInstance()

	getProvider(name: string): ModelProvider | undefined {
		return this.registry.getProvider(name)
	}

	getAllProviders(): ModelProvider[] {
		return this.registry.getAllProviders()
	}
}
