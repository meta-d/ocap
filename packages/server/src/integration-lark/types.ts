import { ITenant, IUser } from "@metad/contracts"
import { LarkService } from "./lark.service"

export type LarkMessage = {
	data: {
		receive_id: string
		content: string
		msg_type: 'text' | 'image' | 'interactive'
		uuid?: string
	}
	params: {
		receive_id_type: 'open_id' | 'user_id' | 'union_id' | 'email' | 'chat_id'
	}
}

export type ChatLarkContext<T = any> = {
	tenant: ITenant
	organizationId: string
	integrationId: string
	user: IUser
	larkService: LarkService
	chatId: string
	chatType: 'p2p' | 'group' | string
	message?: T
}