import { Exclude, Expose } from 'class-transformer'
import { XpertToolset } from '../xpert-toolset.entity'
import { TToolCredentials } from '@metad/contracts'

@Expose()
export class ToolsetPublicDTO extends XpertToolset {
	@Exclude()
	declare options: Record<string, any>

	@Exclude()
	declare credentials?: TToolCredentials

	constructor(partial: Partial<ToolsetPublicDTO>) {
		super()
		Object.assign(this, partial)
	}
}
