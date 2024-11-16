import { ProviderCredentialSchema, ProviderModel } from '@metad/contracts'
import { Exclude, Expose, Transform } from 'class-transformer'
import { PublicAIModelDto } from './public-ai-model'
import { AiProviderDto } from '../../ai-model'

@Expose()
export class ProviderWithModelsDto extends AiProviderDto {

	@Exclude()
	model_credential_schema: ProviderCredentialSchema

	@Exclude()
	provider_credential_schema: ProviderCredentialSchema

	@Transform(({ value }) => value && value.map((_) => new PublicAIModelDto(_)))
	models: ProviderModel[]

	constructor(partial: Partial<ProviderWithModelsDto>) {
		super(partial)
	}
}
