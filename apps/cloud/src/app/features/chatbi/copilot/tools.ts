import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { DataSettings, getEntityDimensions } from '@metad/ocap-core'
import { NGXLogger } from 'ngx-logger'
import { ChatbiService } from '../chatbi.service'
import { transformCopilotChart } from './copilot'
import { ChatAnswerSchema } from './schema'

export function injectCreateChartTool() {
  const logger = inject(NGXLogger)
  const chatbiService = inject(ChatbiService)

  const createFormulaTool = new DynamicStructuredTool({
    name: 'answerQuestion',
    description: 'Create chart answer for the question.',
    schema: ChatAnswerSchema,
    func: async (answer) => {
      logger.debug(`Execute copilot action 'createChart':`, answer)

      const entityType = chatbiService.entityType()

      const { chartAnnotation, slicers, limit, chartOptions } = transformCopilotChart(answer.chart, entityType)

      chatbiService.addAiMessage(
        [
          answer.preface,
          {
            dataSettings: {
              ...(answer.dataSettings ?? {}),
              chartAnnotation,
              presentationVariant: {
                maxItems: limit,
                groupBy: getEntityDimensions(entityType).map((property) => ({
                  dimension: property.name,
                  hierarchy: property.defaultHierarchy,
                  level: null
                }))
              }
            } as DataSettings,
            chartOptions,
            slicers: answer.slicers || slicers
          },
          answer.conclusion
        ].filter(Boolean)
      )

      return `Chart answer is created!`
    }
  })

  return createFormulaTool
}
