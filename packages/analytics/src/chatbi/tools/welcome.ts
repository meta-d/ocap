import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { ChatContext } from '../types'

export function createWelcomeTool(context: ChatContext) {
	const { larkService } = context
	return tool(
		async ({ models }): Promise<string> => {
			await larkService.interactiveMessage({})
			return 'Welcome info has sent to user, waiting for user response...'
		},
		{
			name: 'welcome',
			description: 'Show welcome messages',
			schema: z.object({
				models: z.array(
					z.object({
						id: z.string().describe('The model id'),
						suggestions: z.array(z.string().describe('The suggestion prompt to analysis the data model'))
					})
				)
			})
		}
	)
}
