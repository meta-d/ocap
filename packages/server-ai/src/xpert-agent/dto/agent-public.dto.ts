import { Expose } from 'class-transformer'
import { XpertAgent } from '../../core/entities/internal'

@Expose()
export class XpertAgentPublicDTO extends XpertAgent {
	constructor(partial: Partial<XpertAgentPublicDTO | XpertAgent>) {
		super()
		Object.assign(this, partial)
	}
}
