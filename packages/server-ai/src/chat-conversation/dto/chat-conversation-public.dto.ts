import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { XpertRolePublicDTO } from '../../xpert-role/dto'
import { ChatConversation } from '../conversation.entity'
import { IXpertRole } from '@metad/contracts'

@Expose()
export class ChatConversationPublicDTO extends ChatConversation {

	@Transform((params: TransformFnParams) => (params.value ? new XpertRolePublicDTO(params.value) : null))
	declare role?: IXpertRole

	constructor(partial: ChatConversation) {
		super()
		Object.assign(this, partial)
	}
}
