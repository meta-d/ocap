import { tool } from '@langchain/core/tools'
import { flatten, Logger } from '@nestjs/common'
import { z } from 'zod'
import { ChatContext } from '../types'

export function createWelcomeTool(context: Partial<ChatContext>) {
	const logger = new Logger('WelcomeTool')
	const { conversation } = context
	return tool(
		async ({ models }): Promise<string> => {
			logger.debug(`[ChatBI] [Copilot Tool] [Welcome] models: ${JSON.stringify(models, null, 2)}`)

			conversation.messageWithEndAction([
				{
					tag: 'markdown',
					content: 'Hi, 我是 ChatBI, 我可以根据你的问题分析数据、生成图表, 猜你想问：'
				},
				...flatten(
					models.map(({ modelId, cubeName, prompts }) => {
						const chatModel = conversation.models.find(
							(model) => model.modelId === modelId && model.entity === cubeName
						)
						return [
							{
								tag: 'markdown',
								content: `- 关于数据集 “${chatModel.entityCaption}”, 您可能关心的问题：`
							},
							...prompts.map((prompt) => {
								return {
									tag: 'action',
									actions: [
										{
											tag: 'button',
											text: {
												tag: 'plain_text',
												content: prompt
											},
											type: 'primary_text',
											complex_interaction: true,
											width: 'default',
											size: 'small',
											value: `分析数据集 “${chatModel.entityCaption}”：` + prompt,
										}
									]
								}
							}),
							{
								tag: 'markdown',
								content: `您也可以对我说 “**结束对话**” 来结束本轮对话。`
							}
						]
					})
				)
			],
			(action) => {
				console.log(action)
				conversation.ask(action.value)
			})

			return 'Welcome info has sent to user, waiting for user response...'
		},
		{
			name: 'welcome',
			description: 'Show welcome messages',
			schema: z.object({
				models: z.array(
					z.object({
						modelId: z.string().describe('The model id'),
						cubeName: z.string().describe('The name of cube'),
						prompts: z.array(z.string().describe('The suggestion prompt to analysis the data model'))
					})
				)
			})
		}
	)
}
