import { Exclude, Expose, Transform } from 'class-transformer'
import { IsOptional, IsString, ValidateNested } from 'class-validator'
import { PublicAIModelDto } from './public-ai-model'
import { I18nObject, IProviderEntity, ProviderCredentialSchema, ProviderModel } from '@metad/contracts'

@Expose()
export class ProviderWithModelsDto implements Partial<IProviderEntity> {
	@IsString()
	provider: string

	@ValidateNested()
	label: I18nObject

	@IsOptional()
	@ValidateNested()
	icon_small?: I18nObject

	@IsOptional()
	@ValidateNested()
	icon_large?: I18nObject

	@Exclude()
	model_credential_schema: ProviderCredentialSchema

	@Exclude()
	provider_credential_schema: ProviderCredentialSchema

	@Transform(({ value }) => value && value.map((_) => new PublicAIModelDto(_)))
	models: ProviderModel[]

	constructor(partial: Partial<ProviderWithModelsDto>) {
		Object.assign(this, partial)
	}
}
