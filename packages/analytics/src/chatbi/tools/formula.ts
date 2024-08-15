import { tool } from '@langchain/core/tools'
import { nanoid } from '@metad/copilot'
import { ChatLarkContext } from '@metad/server-core'
import { z } from 'zod'
import { ChatContext } from '../types'

export function createFormulaTool(context: ChatContext, chatContext: ChatLarkContext) {
	const { logger, conversation, larkService } = context
	return tool(
		async ({ modelId, cube, name, formula, unit }): Promise<string> => {
			logger.debug(`Execute copilot action 'createFormula':`, cube, name, formula, unit)
			try {
				const key = nanoid()
				conversation.upsertIndicator({ modelId, id: key, name, entity: cube, code: name, formula, unit })

				await larkService.markdownMessage(
					chatContext,
					`新建计算指标：
**名称:** ${name}
**公式:** 
\`\`\`SQL
${formula}
\`\`\`
${unit ? `**单位:** ${unit}\n` : ''}`
				)

				return `The new calculated measure with key '${key}' has been created!`
			} catch (err: any) {
				logger.error(err)
				return `Error: ${err.message}`
			}
		},
		{
			name: 'createFormula',
			description: 'Create a formula for new measure',
			schema: z.object({
				modelId: z.string().describe('The id of model'),
				cube: z.string().describe('The cube name'),
				name: z.string().describe('The name of calculated measure'),
				formula: z.string().describe('The MDX formula for calculated measure'),
				unit: z.string().optional().describe('The unit of measure')
			})
		}
	)
}
