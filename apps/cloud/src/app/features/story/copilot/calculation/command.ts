import { Signal, computed, inject } from '@angular/core'
import { CopilotAgentType, CopilotCommand, CreateGraphOptions } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/copilot-angular'
import { injectDimensionMemberTool } from '@metad/core'
import { CalculationProperty, DataSettings } from '@metad/ocap-core'
import { NxStoryService } from '@metad/story/core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { derivedAsync } from 'ngxtension/derived-async'
import { of } from 'rxjs'
import { injectAgentFewShotTemplate } from '../../../../@core/copilot'
import { injectPickCubeTool } from '../tools'
import { injectCreateMeasureControlWorker } from './agent-measure-control'
import { injectCreateRestrictedMeasureWorker } from './agent-restricted'
import { createCalculationGraph } from './graph'
import {
  injectCreateConditionalAggregationTool,
  injectCreateFormulaMeasureTool,
  injectCreateVarianceMeasureTool
} from './tools'

export function injectCalculationGraphCommand(
  defaultDataSettings: Signal<DataSettings & {modelId: string}>,
  property: Signal<CalculationProperty | null>,
  callback: (dataSettings: DataSettings, key: string) => void
) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const storyService = inject(NxStoryService)
  const formulaFewShotPrompt = injectAgentFewShotTemplate(`calculated`, { vectorStore: null, score: 0.7, k: 5 })
  const condAggrFewShotPrompt = injectAgentFewShotTemplate(`calculation/aggregation`, {
    vectorStore: null,
    score: 0.7,
    k: 5
  })
  const varianceFewShotPrompt = injectAgentFewShotTemplate(`calculation/variance`, {
    vectorStore: null,
    score: 0.7,
    k: 5
  })

  const defaultCube = derivedAsync(() => {
    const dataSettings = defaultDataSettings()
    return dataSettings ? storyService.selectEntityType(dataSettings) : of(null)
  })

  const defaultModelCube = computed(() => {
    const dataSettings = defaultDataSettings()
    const cube = defaultCube()
    return { dataSource: dataSettings?.dataSource, modelId: dataSettings.modelId, cube }
  })

  const memberRetrieverTool = injectDimensionMemberTool()
  const pickCubeTool = injectPickCubeTool()

  const createFormulaTool = injectCreateFormulaMeasureTool(defaultDataSettings, callback)
  const createConditionalAggregationTool = injectCreateConditionalAggregationTool(defaultDataSettings, callback)
  const createVarianceMeasureTool = injectCreateVarianceMeasureTool(defaultDataSettings, callback)

  const restrictedMeasureWorker = injectCreateRestrictedMeasureWorker(defaultModelCube, callback)
  const runMeasureControlWorker = injectCreateMeasureControlWorker(defaultModelCube, callback)

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
          type: CopilotAgentType.Graph,
          conversation: true
        },
        createGraph: async ({ llm, checkpointer }: CreateGraphOptions) => {
          return await createCalculationGraph({
            llm,
            checkpointer,
            formulaFewShotPrompt,
            condAggrFewShotPrompt,
            varianceFewShotPrompt,
            defaultModelCube,
            pickCubeTool,
            memberRetrieverTool,
            createFormulaTool,
            restrictedMeasureWorker,
            createConditionalAggregationTool,
            createVarianceMeasureTool,
            runMeasureControlWorker
          })
        }
      } as CopilotCommand
    })()
  )
}
