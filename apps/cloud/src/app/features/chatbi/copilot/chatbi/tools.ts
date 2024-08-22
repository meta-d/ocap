import { inject } from '@angular/core'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { tool } from '@langchain/core/tools'
import { nanoid, referencesCommandName } from '@metad/copilot'
import { injectReferencesRetrieverTool } from 'apps/cloud/src/app/@core/copilot'
import { NGXLogger } from 'ngx-logger'
import { z } from 'zod'
import { ChatbiService } from '../../chatbi.service'

export const createIndicatorSchema = z.object({
  dataSource: z.string().describe('The data source name'),
  cube: z.string().describe('The cube name'),
  code: z.string().describe('Indicator unique code'),
  name: z.string().describe(`The caption of indicator in user's language`),
  description: z
    .string()
    .describe(
      'The detail description of calculated measure, business logic and cube info for example: the time dimensions, measures or dimension members involved'
    )
})

/**
 * Create indicator (calculated measure) with formula
 */
export function injectCreateIndicatorTool() {
  const logger = inject(NGXLogger)
  const chatbiService = inject(ChatbiService)
  const referencesRetrieverTool = injectReferencesRetrieverTool([referencesCommandName('calculated')], { k: 3 })

  const context = chatbiService.context

  return (model: BaseChatModel) => {
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

    const llmWithStructuredOutput = model.withStructuredOutput(
      z.object({
        formula: z.string().describe('The MDX formula for calculated measure'),
        unit: z.string().optional().describe('The unit of measure')
      })
    )
    const chain = prompt.pipe(llmWithStructuredOutput)

    return tool(
      async ({ dataSource, cube, code, name, description }) => {
        logger.debug(`Execute copilot action 'createFormula':`, dataSource, cube, name, code, description)

        const references = await referencesRetrieverTool.invoke({
          questions: [`calculated measure name: '${name}', code: '${code}'`]
        })

        const result = await chain.invoke({
          input: `Create mdx formula for indicator named: '${name}', code: '${code}' in cube: '${cube}'. It is ${description}`,
          references,
          context: context()
        })

        try {
          const key = nanoid()
          chatbiService.upsertIndicator({
            id: key,
            entity: cube,
            code,
            name,
            formula: result.formula,
            unit: result.unit
          })
          const dataSource = chatbiService.dataSourceName()
          chatbiService.appendAiMessageData([
            {
              dataSettings: {
                dataSource,
                entitySet: cube
              },
              indicators: [key] // indicators snapshot
            }
          ])
          return `The new calculated measure with key '${code}' has been created!`
        } catch (err: any) {
          return `Error: ${err.message}`
        }
      },
      {
        name: 'createIndicator',
        description: 'Create indicator for new measure',
        schema: createIndicatorSchema
      }
    )
  }
}

export function injectMoreQuestionsTool() {
  const logger = inject(NGXLogger)
  const chatbiService = inject(ChatbiService)

	return tool(
		async ({ questions }): Promise<string> => {
			logger.debug(`more questions tool, questions: ${questions}`)

			chatbiService.appendAiMessageData([
        {
          questions
        }
      ])

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
