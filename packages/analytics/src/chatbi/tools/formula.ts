import { tool } from '@langchain/core/tools'
import { nanoid } from '@metad/copilot'
import { z } from 'zod'
import { ChatContext } from '../types'

export function createFormulaTool(context: ChatContext) {
	const { logger, conversation } = context
	return tool(
		async (indicator): Promise<string> => {
			logger.debug(`[ChatBI] [Copilot Tool] [createFormula]: ${JSON.stringify(indicator)}`)
			try {
				const key = nanoid()
				conversation.upsertIndicator({
					modelId: indicator.modelId,
					id: key,
					name: indicator.name,
					entity: indicator.cube,
					code: indicator.code,
					formula: indicator.formula,
					unit: indicator.unit
				})
				await conversation.continue([
					{
						tag: 'markdown',
						content: `新建计算指标：
**名称:** ${indicator.name}
**编码:** ${indicator.code}
**公式:** 
\`\`\`SQL
${indicator.formula}
\`\`\`
${indicator.unit ? `**单位:** ${indicator.unit}\n` : ''}`
					}
				])

				return `The new calculated measure with code '${indicator.code}' has been created!`
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
				code: z.string().describe('The code of calculated measure'),
				name: z.string().describe(`The caption of calculated measure in user's language`),
				formula: z.string().describe('The MDX formula for calculated measure'),
				unit: z.string().optional().describe('The unit of measure')
			})
		}
	)
}
