import { ICopilotWithProvider } from '@metad/contracts'
import { Expose, Exclude } from 'class-transformer'
import { ProviderWithModelsDto } from './provider-with-models'

@Expose()
export class CopilotWithProviderDto implements Partial<ICopilotWithProvider> {

	id: string

	providerWithModels: ProviderWithModelsDto

	@Exclude()
	apiKey?: string

	constructor(partial: Partial<CopilotWithProviderDto>) {
		Object.assign(this, partial)
	}
}
