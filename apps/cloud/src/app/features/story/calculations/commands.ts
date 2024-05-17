import { Signal, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CopilotAgentType, CopilotCommand } from '@metad/copilot'
import { makeCubeRulesPrompt, markdownEntityType } from '@metad/core'
import { injectCopilotCommand } from '@metad/ocap-angular/copilot'
import { CalculatedProperty, CalculationProperty, CalculationType } from '@metad/ocap-core'
import { ENTITY_TYPE_SALESORDER } from '@metad/ocap-sql'
import { NxStoryService } from '@metad/story/core'
import { MEMBER_RETRIEVER_TOKEN, createDimensionMemberRetrieverTool } from '@metad/story/story'
import { TranslateService } from '@ngx-translate/core'
import { nanoid } from 'nanoid'
import { NGXLogger } from 'ngx-logger'
import { derivedAsync } from 'ngxtension/derived-async'
import { firstValueFrom, of } from 'rxjs'
import { z } from 'zod'


export function injectCalculationCommand(
  storyService: NxStoryService,
  property: Signal<CalculationProperty | null>
) {
  const router = inject(Router)
  const route = inject(ActivatedRoute)
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const memberRetriever = inject(MEMBER_RETRIEVER_TOKEN)

  const defaultModel = signal<string>(null)
  const defaultDataSource = signal<string>(null)
  const defaultEntity = signal<string>(null)

  const defaultDataSettings = computed(() => defaultEntity() ? {
    dataSource: defaultDataSource(),
    entitySet: defaultEntity()
  } : null)

  const defaultCube = derivedAsync(() => {
    const dataSettings = defaultDataSettings()
    return dataSettings ? storyService.selectEntityType(dataSettings) : of(null)
  })

  function navigate(key: string) {
    router.navigate(['../', key], { relativeTo: route })
  }

  const createChartTool = new DynamicStructuredTool({
    name: 'createCalculationMeasure',
    description: 'Create a new calculation measure for cube.',
    schema: CalculationSchema,
    func: async ({ name, formula }) => {
      const key = nanoid()
      storyService.addCalculationMeasure({ dataSettings: defaultDataSettings(), calculation: {
        __id__: key,
        name,
        calculationType: CalculationType.Calculated,
        formula
      } as CalculatedProperty })

      navigate(key)

      return `Calculation measure created!`
    }
  })

  const memberRetrieverTool = createDimensionMemberRetrieverTool(memberRetriever, defaultModel, defaultEntity)
  const tools = [memberRetrieverTool, createChartTool]
  return injectCopilotCommand(
    'calculation',
    {
      alias: 'cc',
      description: 'Describe the widget you want',
      agent: {
        type: CopilotAgentType.Default
      },
      systemPrompt: async ({ params }) => {

        console.log('params:', params)
        let entityType = defaultCube()
        let prompt = ''
        const cubeParams = params?.filter((param) => param.item)
          if (cubeParams?.length) {
            defaultModel.set(cubeParams[0].item.value.dataSourceId)
            defaultDataSource.set(cubeParams[0].item.value.dataSource.key)
            defaultEntity.set(cubeParams[0].item.key)
          } else {
            if (!defaultModel() || !defaultEntity()) {
              const result = await storyService.openDefultDataSettings()

              if (result?.dataSource && result?.entities[0]) {
                defaultModel.set(result.modelId)
                defaultDataSource.set(result.dataSource)
                defaultEntity.set(result.entities[0])

                entityType = await firstValueFrom(storyService.selectEntityType({ dataSource: result.dataSource, entitySet: result.entities[0] }))
              }
            }

            prompt += `The Cube structure is:
\`\`\`
${entityType ? markdownEntityType(entityType) : 'unknown'}
\`\`\`
`
          }

        return `${prompt}
Original calculation measure is:
\`\`\`
${property() ? JSON.stringify(property(), null, 2) : 'No calculation property selected'}
\`\`\`
`
      },
      tools,
      prompt: ChatPromptTemplate.fromMessages([
        [
          'system',
          `你是一个有用的数据分析 Agent，请使用 MDX technology to edit or create calculation measure based on the Cube information.
A dimension can only be used once, and a hierarchy cannot appear on multiple independent axes.

${makeCubeRulesPrompt()}

for examples:
The cube info is:

${markdownEntityType(ENTITY_TYPE_SALESORDER)}

qustion: 'Sales amount of product category bikes'
think: call 'dimensionMemberKeySearch' tool with query param 'product category bikes' to get member key of 'bikes' in dimension 'product category'
ai: create a formula like 'sum([Measures].[Sales], [Product.Products].[Bikes])' named 'Sales of Bikes'

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
  )
}

export const CalculationSchema = z.object({
  name: z.string().optional().describe(`Name of the calculation measure`),
  formula: z.string().optional().describe(`MDX Formula of the calculated measure`),
})
