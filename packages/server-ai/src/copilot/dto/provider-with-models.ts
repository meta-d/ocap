import { I18nObject, IProviderEntity, ProviderCredentialSchema, ProviderModel } from '@metad/contracts'
import { Exclude, Expose, Transform } from 'class-transformer'
import { IsOptional, IsString, ValidateNested } from 'class-validator'
import { PublicAIModelDto } from './public-ai-model'

@Expose()
export class ProviderWithModelsDto implements Partial<IProviderEntity> {
	@IsString()
	provider: string

	@ValidateNested()
	label: I18nObject

	@IsOptional()
	@ValidateNested()
	@Transform(
		({ value, obj }) =>
			value && {
				en_US: `${obj.urlPrefix}/icon_small/en_US`,
				zh_Hans: `${obj.urlPrefix}/icon_small/zh_Hans`
			}
	)
	icon_small?: I18nObject

	@IsOptional()
	@ValidateNested()
	@Transform(
		({ value, obj }) =>
			value && {
				en_US: `${obj.urlPrefix}/icon_large/en_US`,
				zh_Hans: `${obj.urlPrefix}/icon_large/zh_Hans`
			}
	)
	icon_large?: I18nObject

	@Exclude()
	model_credential_schema: ProviderCredentialSchema

	@Exclude()
	provider_credential_schema: ProviderCredentialSchema

	@Transform(({ value }) => value && value.map((_) => new PublicAIModelDto(_)))
	models: ProviderModel[]

	@Exclude()
	urlPrefix?: string

	constructor(partial: Partial<ProviderWithModelsDto>) {
		Object.assign(this, partial)
		this.urlPrefix = `/api/copilot/provider/${partial.provider}`
	}
}
