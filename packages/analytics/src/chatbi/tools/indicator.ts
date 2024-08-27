import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { DynamicStructuredTool, tool } from '@langchain/core/tools'
import { nanoid } from '@metad/copilot'
import { markdownModelCube } from '@metad/ocap-core'
import { z } from 'zod'
import { ChatContext } from '../types'

const prompt = ChatPromptTemplate.fromMessages(
	[
		[
			'system',
			`You are a professional BI data analyst and are using Microsoft's mdx for indicator management.
Please create calculation formula for indicator based on reference documents and cube context.

Reference Documentations:
{{references}}

The cube context is:
{{context}}
`
		],
		['human', '{{input}}']
	],
	{ templateFormat: 'mustache' }
)

export function createIndicatorTool(
	model: BaseChatModel,
	referencesRetrieverTool: DynamicStructuredTool,
	context: ChatContext
) {
	const { logger, conversation } = context

	const llmWithStructuredOutput = model.withStructuredOutput(
		z.object({
			formula: z.string().describe('The MDX formula for calculated measure'),
			unit: z.string().optional().describe('The unit of measure')
		})
	)
	const chain = prompt.pipe(llmWithStructuredOutput)

	return tool(
		async (indicator): Promise<string> => {
			logger.debug(`[ChatBI] [Copilot Tool] [createFormula]: ${JSON.stringify(indicator)}`)

			const entityType = await conversation.getCube(indicator.modelId, indicator.cube)

			if (!entityType) {
				return `Error: can't found type for cube '${indicator.cube}'`
			}

			const context = markdownModelCube({
				modelId: indicator.modelId,
				dataSource: indicator.modelId,
				cube: entityType
			})

			const references = await referencesRetrieverTool.invoke({
				questions: [
					`calculated measure name: '${indicator.name}', code: '${indicator.code}', description: ${indicator.description}`
				]
			})

			const result = await chain.invoke({
				input: `Create mdx formula for indicator named: '${indicator.name}', code: '${indicator.code}' in cube: '${indicator.cube}'. It is ${indicator.description}`,
				references,
				context
			})

			try {
				const key = nanoid()
				conversation.upsertIndicator({
					modelId: indicator.modelId,
					id: key,
					name: indicator.name,
					entity: indicator.cube,
					code: indicator.code,
					formula: result.formula,
					unit: result.unit
				})
				await conversation.continue([
					{
						tag: 'markdown',
						content: `:Pin: 新建计算指标：
**名称:** ${indicator.name}
**编码:** ${indicator.code}
**公式:** 
\`\`\`SQL
${result.formula}
\`\`\`
${result.unit ? `**单位:** ${result.unit}\n` : ''}`
					},
					{
						tag: 'hr'
					},
				])

				return `The new calculated measure with code '${indicator.code}' has been created!`
			} catch (err: any) {
				logger.error(err)
				return `Error: ${err.message}`
			}
		},
		{
			name: 'createIndicator',
			description: 'Create a indicator for new measure',
			schema: z.object({
				modelId: z.string().describe('The id of model'),
				cube: z.string().describe('The cube name'),
				code: z.string().describe('The unique code of indicator'),
				name: z.string().describe(`The caption of indicator in user's language`),

				description: z
					.string()
					.describe(
						'The detail description of calculated measure, business logic and cube info for example: the time dimensions, measures or dimension members involved'
					)
			})
		}
	)
}
