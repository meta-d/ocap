import { Exclude, Expose, Transform } from 'class-transformer'
import { IsOptional, IsString, ValidateNested } from 'class-validator'
import { I18nObject, ProviderModel } from '../../ai-model/index'
import { PublicAIModelDto } from './public-ai-model'

@Expose()
export class ProviderWithModelsDto {
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
	model_credential_schema: unknown

	@Exclude()
	provider_credential_schema: unknown

	@Transform(({ value }) => value && value.map((_) => new PublicAIModelDto(_)))
	models: ProviderModel[]

	constructor(partial: Partial<ProviderWithModelsDto>) {
		Object.assign(this, partial)
	}
}
