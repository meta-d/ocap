import { IAiProviderEntity } from '@metad/contracts'
import { Expose, Transform } from 'class-transformer'
import { AiProviderDto } from '../../ai-model'

@Expose()
export class CopilotProviderDto {
	@Transform(({ value }) => value && new AiProviderDto(value))
	provider: IAiProviderEntity

	constructor(partial: Partial<CopilotProviderDto>) {
		Object.assign(this, partial)
	}
}
