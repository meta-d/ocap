
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Expose } from 'class-transformer';
import { ProviderModel, I18nObject } from '../../ai-model/index'
import { ProviderWithModelsDto } from './provider-with-models';


@Expose()
export class CopilotWithProviderDto {

    providerWithModels: ProviderWithModelsDto

	constructor(partial: Partial<CopilotWithProviderDto>) {
		Object.assign(this, partial)
	}
}
