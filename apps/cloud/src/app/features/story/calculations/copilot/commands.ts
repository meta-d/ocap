import { Signal, computed, inject, signal } from '@angular/core'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CopilotAgentType, CopilotCommand } from '@metad/copilot'
import { makeCubeRulesPrompt, markdownEntityType } from '@metad/core'
import { injectCopilotCommand } from '@metad/ocap-angular/copilot'
import {
  CalculatedProperty,
  CalculationProperty,
  CalculationType,
  DataSettings,
  RestrictedMeasureProperty
} from '@metad/ocap-core'
import { NxStoryService } from '@metad/story/core'
import { MEMBER_RETRIEVER_TOKEN, createDimensionMemberRetrieverTool } from '@metad/story/story'
import { TranslateService } from '@ngx-translate/core'
import { nanoid } from 'nanoid'
import { NGXLogger } from 'ngx-logger'
import { derivedAsync } from 'ngxtension/derived-async'
import { firstValueFrom, of } from 'rxjs'
import { CalculationExamples, CalculationSchema, RestrictedMeasureSchema } from './schema'


export function injectCalculationCommand(
  storyService: NxStoryService,
  property: Signal<CalculationProperty | null>,
  callback: (dataSettings: DataSettings, key: string) => void
) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const memberRetriever = inject(MEMBER_RETRIEVER_TOKEN)

  const defaultModel = signal<string>(null)
  const defaultDataSource = signal<string>(null)
  const defaultEntity = signal<string>(null)

  const defaultDataSettings = computed(() =>
    defaultEntity()
      ? {
          dataSource: defaultDataSource(),
          entitySet: defaultEntity()
        }
      : null
  )

  const defaultCube = derivedAsync(() => {
    const dataSettings = defaultDataSettings()
    return dataSettings ? storyService.selectEntityType(dataSettings) : of(null)
  })

  const createFormulaTool = new DynamicStructuredTool({
    name: 'createCalcalatedMeasure',
    description: 'Create or edit calculated measure for cube.',
    schema: CalculationSchema,
    func: async ({ __id__, name, caption, formula }) => {
      const key = __id__ || nanoid()
      const dataSettings = defaultDataSettings()
      const calculation = {
        __id__: key,
        name,
        caption,
        calculationType: CalculationType.Calculated,
        formula
      } as CalculatedProperty
      storyService.addCalculationMeasure({ dataSettings, calculation })

      logger.debug(`Calculation measure created: `, dataSettings, calculation)

      callback(dataSettings, key)

      return `Calculation measure created!`
    }
  })

  const createRestrictedMeasureTool = new DynamicStructuredTool({
    name: 'createRestrictedMeasure',
    description: 'Create or edit restricted measure for cube.',
    schema: RestrictedMeasureSchema,
    func: async (property) => {
      const key = property.__id__ || nanoid()
      const dataSettings = defaultDataSettings()
      storyService.addCalculationMeasure({
        dataSettings,
        calculation: {
          ...property,
          __id__: key,
          calculationType: CalculationType.Restricted,
        } as RestrictedMeasureProperty
      })

      logger.debug(`Calculation measure created: `, dataSettings, property)

      callback(dataSettings, key)

      return `Calculation measure created!`
    }
  })

  const memberRetrieverTool = createDimensionMemberRetrieverTool(memberRetriever, defaultModel, defaultEntity)
  const tools = [memberRetrieverTool, createFormulaTool, createRestrictedMeasureTool]
  return injectCopilotCommand('calculation', {
    alias: 'cc',
    description: 'Describe the widget you want',
    agent: {
      type: CopilotAgentType.Default
    },
    systemPrompt: async ({ params }) => {
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

            entityType = await firstValueFrom(
              storyService.selectEntityType({ dataSource: result.dataSource, entitySet: result.entities[0] })
            )
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
        `你是一个有用的数据分析 Agent，请使用 MDX technology to edit (if original calculation measure is provided) or create (if original calculation measure is not provided) calculation measure based on the Cube information.
请选择一种合适的 tool 来创建 calculation measure.
A dimension can only be used once, and a hierarchy cannot appear on multiple independent axes.
The new calculation measure name should be unique.

${makeCubeRulesPrompt()}

<for examples>
${CalculationExamples}
</for examples>

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
  } as CopilotCommand)
}
