import { ChatLarkContext } from '@metad/server-core'
import { C_CHATBI_END_CONVERSATION, IChatBIConversation } from './types'

export type ChatLarkMessageStatus = 'thinking' | 'continuing' | 'waiting' | 'done' | 'end' | 'error'
export class ChatLarkMessage {
	private id: string = null
	public status: ChatLarkMessageStatus = 'thinking'

	get larkService() {
		return this.chatContext.larkService
	}

	private header = null
	private elements = []
	constructor(
		private chatContext: ChatLarkContext,
		private text: string,
		private conversation: IChatBIConversation
	) {}

	getTitle() {
		switch (this.status) {
			case 'thinking':
				return '正在思考...'
			case 'continuing':
				return '继续思考...'
			case 'waiting':
				return '还在思考，请稍后...'
			default:
				return ''
		}
	}

	getSubtitle() {
		return this.text
	}

	getHeader() {
		return {
			title: {
				tag: 'plain_text',
				content: this.getTitle()
			},
			subtitle: {
				tag: 'plain_text', // 固定值 plain_text。
				content: this.getSubtitle()
			},
			template: 'blue',
			ud_icon: {
				token: 'myai_colorful', // 图标的 token
				style: {
					color: 'red' // 图标颜色
				}
			}
		}
	}

	getCard() {
		const elements = [...this.elements]
		if (!['end'].includes(this.status)) {
			elements.push(this.getEndAction())
		}
		return {
			elements
		}
	}

	getEndAction() {
		return {
			tag: 'action',
			actions: [
				{
					tag: 'button',
					text: {
						tag: 'plain_text',
						content: '结束对话'
					},
					type: 'primary_text',
					complex_interaction: true,
					width: 'default',
					size: 'medium',
					value: C_CHATBI_END_CONVERSATION
				}
			]
		}
	}

	async update(options?: {
		status?: ChatLarkMessageStatus
		elements?: any[]
		header?: any
		action?: (action) => void
	}) {
		if (options?.status) {
			this.status = options.status
		}
		if (options?.elements) {
			this.elements.push(...options.elements)
		}
		if (options?.header) {
			this.header = options.header
		}
		if (this.id) {
			if (options?.action) {
				this.larkService
					.patchAction(this.id, {
						...this.getCard(),
						header: this.header ?? this.getHeader(),
					})
					.subscribe((action) => {
						options.action(action)
					})
			} else {
				await this.larkService.patchInteractiveMessage(this.id, {
					...this.getCard(),
					header: this.header ?? this.getHeader(),
				})
			}
		} else {
			const result = await this.larkService.interactiveActionMessage(
				this.chatContext,
				{
					...this.getCard(),
					header: this.header ?? this.getHeader(),
				},
				{
					next: async (action) => {
						if (
							action?.value === C_CHATBI_END_CONVERSATION ||
							action?.value === `"${C_CHATBI_END_CONVERSATION}"`
						) {
							await this.conversation.end()
						} else {
							// callback?.(action)
						}
					},
					error: (err) => {
						console.error(err)
					}
				}
			)

			this.id = result.data.message_id
		}
	}
}
export type ChatStack = {
	text: string
	message: ChatLarkMessage
}
