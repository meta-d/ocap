import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { XpertRole } from '../../core/entities/internal'
import { XpertRolePublicDTO } from '../../xpert-role/dto'
import { ChatConversation } from '../conversation.entity'

@Expose()
export class ChatConversationPublicDTO extends ChatConversation {

	@Transform((params: TransformFnParams) => (params.value ? new XpertRolePublicDTO(params.value) : null))
	role: XpertRole

	constructor(partial: ChatConversation) {
		super()
		Object.assign(this, partial)
	}
}
