import { Signal, computed, inject, signal } from '@angular/core'
import { SemanticSimilarityExampleSelector } from '@langchain/core/example_selectors'
import { ChatPromptTemplate, FewShotPromptTemplate, MessagesPlaceholder, PromptTemplate } from '@langchain/core/prompts'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CopilotAgentType, CopilotCommand } from '@metad/copilot'
import { CalculationSchema, injectDimensionMemberRetrieverTool, makeCubeRulesPrompt, markdownEntityType } from '@metad/core'
import { NgmCopilotService, injectCopilotCommand } from '@metad/ocap-angular/copilot'
import {
  CalculatedProperty,
  CalculationProperty,
  CalculationType,
  DataSettings,
  RestrictedMeasureProperty
} from '@metad/ocap-core'
import { NxStoryService } from '@metad/story/core'
import { VectorStoreRetriever, injectAgentFewShotTemplate } from 'apps/cloud/src/app/@core/copilot'
import { CopilotExampleService } from 'apps/cloud/src/app/@core/services'
import { nanoid } from 'nanoid'
import { NGXLogger } from 'ngx-logger'
import { derivedAsync } from 'ngxtension/derived-async'
import { firstValueFrom, of } from 'rxjs'
import { RestrictedMeasureSchema } from './schema'

const examplePrompt = PromptTemplate.fromTemplate(`Question: {input}
Answer: {output}`)

export function injectCalculationCommand(
  storyService: NxStoryService,
  dataSettings: Signal<DataSettings>,
  property: Signal<CalculationProperty | null>,
  callback: (dataSettings: DataSettings, key: string) => void
) {
  const logger = inject(NGXLogger)
  // const translate = inject(TranslateService)
  const copilotExampleService = inject(CopilotExampleService)
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
          calculationType: CalculationType.Restricted
        } as RestrictedMeasureProperty
      })

      logger.debug(`Calculation measure created: `, dataSettings, property)

      callback(dataSettings, key)

      return `Calculation measure created!`
    }
  })

  const tools = [memberRetrieverTool, createFormulaTool, createRestrictedMeasureTool]
  const commandName = 'calculation'
  return injectCopilotCommand(commandName,
    (async () => {
      return {
        alias: 'cc',
        description: 'Describe logic of the calculation you want',
        agent: {
          type: CopilotAgentType.Default
        },
        systemPrompt: async ({ params }) => {
          // Add responsibility of business role
          const role = copilotService.roleDetail()
          let prompt = role ? `Your role is '${role.title}', and your responsibility is ${role.description};` : ''
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
        fewShotPrompt: injectAgentFewShotTemplate(commandName, {vectorStore: null, score: 0.1}),
        // new FewShotPromptTemplate({
        //   exampleSelector: new SemanticSimilarityExampleSelector({
        //     vectorStoreRetriever: new VectorStoreRetriever(
        //       {
        //         vectorStore: null,
        //         command: 'calculation',
        //         role: copilotService.role
        //       },
        //       copilotExampleService
        //     ),
        //     inputKeys: ['input']
        //   }),
        //   examplePrompt,
        //   prefix: `Refer to the examples below to provide solutions to the problem.`,
        //   suffix: 'Question: {input}\nAnswer: ',
        //   inputVariables: ['input']
        // }),
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
