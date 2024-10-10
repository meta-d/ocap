import { IKnowledgebase } from '@metad/contracts'
import { Exclude, Expose } from 'class-transformer'
import { Knowledgebase } from '../knowledgebase.entity'

@Exclude()
export class KnowledgebasePublicDTO extends Knowledgebase {
    @Expose()
	declare id: string

	@Expose()
	declare name: string

	@Expose()
	declare language?: 'Chinese' | 'English'

	@Expose()
	declare avatar?: string

	@Expose()
	declare description?: string

	@Expose()
	declare status: string

	constructor(partial: IKnowledgebase) {
		super()
		Object.assign(this, partial)
	}
}
