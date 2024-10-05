import { Exclude, Expose } from 'class-transformer'
import { XpertToolset } from '../xpert-toolset.entity'

@Expose()
export class ToolsetPublicDTO extends XpertToolset {
	@Exclude()
	options: Record<string, any>

	constructor(partial: Partial<ToolsetPublicDTO>) {
		super()
		Object.assign(this, partial)
	}
}
