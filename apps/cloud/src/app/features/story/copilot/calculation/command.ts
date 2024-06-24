import { Signal, computed, inject, signal } from '@angular/core'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { CopilotAgentType, CopilotCommand } from '@metad/copilot'
import { NgmCopilotService, injectCopilotCommand } from '@metad/copilot-angular'
import { injectDimensionMemberRetrieverTool, makeCubeRulesPrompt, markdownEntityType } from '@metad/core'
import { CalculationProperty, DataSettings } from '@metad/ocap-core'
import { NxStoryService } from '@metad/story/core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { derivedAsync } from 'ngxtension/derived-async'
import { firstValueFrom, of } from 'rxjs'
import { injectAgentFewShotTemplate } from '../../../../@core/copilot'
import {
  injectCreateConditionalAggregationTool,
  injectCreateFormulaMeasureTool,
  injectCreateMeasureControlTool,
  injectCreateRestrictedMeasureTool,
  injectCreateVarianceMeasureTool
} from './tools'

export function injectCalculationCommand(
  storyService: NxStoryService,
  dataSettings: Signal<DataSettings>,
  property: Signal<CalculationProperty | null>,
  callback: (dataSettings: DataSettings, key: string) => void
) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const copilotService = inject(NgmCopilotService)

  const defaultModel = signal<string>(null)
  const defaultDataSource = signal<string>(null)
  const defaultEntity = signal<string>(null)
  const memberRetrieverTool = injectDimensionMemberRetrieverTool(defaultModel, defaultEntity)

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

  const createFormulaTool = injectCreateFormulaMeasureTool(defaultDataSettings, callback)
  const createRestrictedMeasureTool = injectCreateRestrictedMeasureTool(defaultDataSettings, callback)
  const createConditionalAggregationTool = injectCreateConditionalAggregationTool(defaultDataSettings, callback)
  const createVarianceMeasureTool = injectCreateVarianceMeasureTool(defaultDataSettings, callback)
  const createMeasureControlTool = injectCreateMeasureControlTool(defaultDataSettings, callback)

  const tools = [
    memberRetrieverTool,
    createFormulaTool,
    createRestrictedMeasureTool,
    createConditionalAggregationTool,
    createVarianceMeasureTool,
    createMeasureControlTool
  ]
  const commandName = 'calculation'
  return injectCopilotCommand(
    commandName,
    (async () => {
      return {
        alias: 'cc',
        description: translate.instant('PAC.Story.CommandCalculationDesc', {
          Default: 'Describe logic of the calculation you want'
        }),
        agent: {
          type: CopilotAgentType.Default
        },
        systemPrompt: async ({ params }) => {
          // Add responsibility of business role
          let prompt = copilotService.rolePrompt()
          // Add context of cube
          let entityType = defaultCube()
          const cubeParams = params?.filter((param) => param.item)
          if (cubeParams?.length) {
            defaultModel.set(cubeParams[0].item.value.dataSourceId)
            defaultDataSource.set(cubeParams[0].item.value.dataSource.key)
            defaultEntity.set(cubeParams[0].item.key)
          } else {
            if (property() && dataSettings()) {
              defaultDataSource.set(dataSettings().dataSource)
              defaultEntity.set(dataSettings().entitySet)
              entityType = await firstValueFrom(storyService.selectEntityType(dataSettings()))
            }

            if (!defaultEntity() || !defaultEntity()) {
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
        fewShotPrompt: injectAgentFewShotTemplate(commandName, { vectorStore: null, score: 0.7, k: 5 }),
        prompt: ChatPromptTemplate.fromMessages([
          [
            'system',
            `You are a useful data analysis agent. Please use MDX technology to edit (if the original calculation measure is provided) or create (if the original calculation measure is not provided) a calculation measure based on the cube information.
Please select an appropriate tool to create the calculation measure.
A dimension can only be used once, and a hierarchy cannot appear on multiple independent axes.
The name of new calculation measure should be unique with existing measures.

${makeCubeRulesPrompt()}

{system_prompt}
`
          ],
          new MessagesPlaceholder({
            variableName: 'chat_history',
            optional: true
          }),
          ['human', '{input}'],
          new MessagesPlaceholder('agent_scratchpad')
        ])
      } as CopilotCommand
    })()
  )
}
