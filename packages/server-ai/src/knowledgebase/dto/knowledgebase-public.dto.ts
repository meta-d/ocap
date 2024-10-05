import { IKnowledgebase } from '@metad/contracts'
import { Exclude, Expose } from 'class-transformer'
import { Knowledgebase } from '../knowledgebase.entity'

@Exclude()
export class KnowledgebasePublicDTO extends Knowledgebase {
    @Expose()
	id: string

	@Expose()
	name: string

	@Expose()
	language?: 'Chinese' | 'English'

	@Expose()
	avatar?: string

	@Expose()
	description?: string

	@Expose()
	status: string

	constructor(partial: IKnowledgebase) {
		super()
		Object.assign(this, partial)
	}
}
