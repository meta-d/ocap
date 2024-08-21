import { tool } from '@langchain/core/tools'
import { Logger } from '@nestjs/common'
import { z } from 'zod'
import { ChatContext } from '../types'

export function createMoreQuestionsTool(context: Partial<ChatContext>) {
	const logger = new Logger('MoreQuestionsTool')
	const { conversation } = context
	return tool(
		async ({ questions }): Promise<string> => {
			logger.debug(`more questions tool, questions: ${questions}`)

			conversation?.updateMessage({
				elements: [
					{
						tag: 'markdown',
						content: '您还可以尝试以下分析：'
					},
					...questions.map((q) => ({
						tag: 'action',
						actions: [
							{
								tag: 'button',
								text: {
									tag: 'plain_text',
									content: q
								},
								type: 'primary_text',
								complex_interaction: true,
								width: 'default',
								size: 'medium',
								value: q
							}
						]
					})),
					{
						tag: 'markdown',
						content: '如果有其他问题，欢迎随时提问！'
					}
				]
			})

			return 'More questions have sent to user.'
		},
		{
			name: 'giveMoreQuestions',
			description: `Give user more question prompts about how to drilldown other dimensions or one of dimension members, for examples: '分析<某维度1>成员<xxx>在<某维度2>上的<度量>分布'`,
			schema: z.object({
				questions: z.array(z.string().describe('The suggestion prompts, 3 will be enough.'))
			})
		}
	)
}
