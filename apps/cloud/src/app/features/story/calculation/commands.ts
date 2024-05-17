import { Signal, inject } from '@angular/core'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CopilotAgentType, CopilotCommand } from '@metad/copilot'
import { makeCubeRulesPrompt } from '@metad/core'
import { injectCopilotCommand } from '@metad/ocap-angular/copilot'
import { CalculationProperty } from '@metad/ocap-core'
import { NxStoryService } from '@metad/story/core'
import { MEMBER_RETRIEVER_TOKEN } from '@metad/story/story'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { z } from 'zod'


export function injectCalculationCommand(storyService: NxStoryService, property: Signal<CalculationProperty | null>) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const memberRetriever = inject(MEMBER_RETRIEVER_TOKEN)

  const createChartTool = new DynamicStructuredTool({
    name: 'createCalculationMeasure',
    description: 'Create a new calculation measure for cube.',
    schema: CalculationSchema,
    func: async ({ name }) => {
      return `Story chart widget created!`
    }
  })

  return injectCopilotCommand(
    'calculation',
    (async () => {
      const tools = [createChartTool]
      return {
        alias: 'cc',
        description: 'Describe the widget you want',
        agent: {
          type: CopilotAgentType.Default
        },
        systemPrompt: async ({ params }) => {
          


          console.log('params:', params)

          const prompt = ``
          return `${prompt}
Original calculation is:
\`\`\`
${property() ? JSON.stringify(property(), null, 2) : 'No calculation property selected'}
\`\`\`
`
        },
        tools,
        prompt: ChatPromptTemplate.fromMessages([
          [
            'system',
            `You are a BI analysis expert. Please use MDX technology to edit or create chart widget configurations based on Cube information.
You must first call the 'dimensionMemberKeySearch' tool to obtain documentation related to dimension member keys (unique member name).
A dimension can only be used once, and a hierarchy cannot appear on multiple independent axes.

${makeCubeRulesPrompt()}

for examples:

qustion: 'sales amout by customer country filter by product bikes'
think: call 'dimensionMemberKeySearch' tool with query param 'product bikes' to get member key of 'product bikes'

{context}

{system_prompt}
`
          ],
          new MessagesPlaceholder({
            variableName: 'chat_history',
            optional: true
          }),
          ['user', '{input}'],
          new MessagesPlaceholder('agent_scratchpad')
        ])
      } as CopilotCommand
    })()
  )
}

export const CalculationSchema = z.object({
  name: z.string().optional().describe(`Name of the calculation measure`),
  formula: z.string().optional().describe(`MDX Formula of the calculated measure`),
})
