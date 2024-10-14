import { IXpert } from '@metad/contracts'
import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { XpertPublicDTO } from '../../xpert/dto'
import { ChatConversation } from '../conversation.entity'

@Expose()
export class ChatConversationPublicDTO extends ChatConversation {
	
	@Transform((params: TransformFnParams) => (params.value ? new XpertPublicDTO(params.value) : null))
	declare xpert?: IXpert

	constructor(partial: ChatConversation) {
		super()
		Object.assign(this, partial)
	}
}
