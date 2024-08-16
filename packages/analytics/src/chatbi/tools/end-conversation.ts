import { tool } from '@langchain/core/tools'
import { ChatLarkContext } from '@metad/server-core'
import { take } from 'rxjs/operators'
import { z } from 'zod'
import { ChatBIConversation } from '../conversation'
import { ChatContext } from '../types'

export function createEndTool(context: ChatContext) {
	const { conversation } = context
	return tool(
		async (answer): Promise<string> => {
			conversation.newThread()
			return 'The conversation is end!'
		},
		{
			name: 'end',
			description: 'End the conversation',
			schema: z.object({})
		}
	)
}

export async function errorWithEndMessage(context: ChatLarkContext, error: string, conversation: ChatBIConversation) {
	const { larkService } = context
	const data = {
		config: {
			enable_forward: false
		},
		header: {
			title: {
				tag: 'plain_text',
				content: '错误信息'
			}
		},
		elements: [
			{
				tag: 'div',
				text: {
					tag: 'plain_text',
					content: error
				}
			},
			{
				tag: 'action',
				actions: [
					{
						tag: 'button',
						text: {
							tag: 'plain_text',
							content: '结束对话'
						},
						type: 'primary',
						value: 'chatbi-end-conversation'
					}
				]
			}
		]
	}

	larkService
		.action({
			params: {
				receive_id_type: 'chat_id'
			},
			data: {
				receive_id: context.chatId,
				content: JSON.stringify(data),
				msg_type: 'interactive'
			}
		})
		.pipe(take(1))
		.subscribe(() => {
			conversation.newThread()
		})
}
