import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { ChatContext } from '../types'

export function createEndTool(context: ChatContext) {
	const { logger, chatId, larkService, chatBIService } = context
	return tool(
		async (answer): Promise<string> => {
			chatBIService.endConversation(context.conversationId)
			return 'The conversation is end!'
		},
		{
			name: 'end',
			description: 'End the conversation',
			schema: z.object({})
		}
	)
}
