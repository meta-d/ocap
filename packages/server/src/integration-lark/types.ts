export type LarkMessage = {
	data: {
		receive_id: string
		content: string
		msg_type: 'text' | 'image'
		uuid?: string
	}
	params: {
		receive_id_type: 'open_id' | 'user_id' | 'union_id' | 'email' | 'chat_id'
	}
}
