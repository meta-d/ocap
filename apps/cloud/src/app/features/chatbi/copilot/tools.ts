import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { NxChartType, tryFixSlicer } from '@metad/core'
import { ChartOrient, DataSettings, getEntityDimensions, PieVariant } from '@metad/ocap-core'
import { NGXLogger } from 'ngx-logger'
import { ChatbiService } from '../chatbi.service'
import { QuestionAnswer } from '../types'
import { transformCopilotChart } from './copilot'
import { ChatAnswerSchema } from './schema'

export function injectCreateChartTool() {
  const logger = inject(NGXLogger)
  const chatbiService = inject(ChatbiService)

  const createFormulaTool = new DynamicStructuredTool({
    name: 'answerQuestion',
    description: 'Create chart answer for the question',
    schema: ChatAnswerSchema,
    func: async (answer) => {
      logger.debug(`Execute copilot action 'createChart':`, answer)

      const entityType = chatbiService.entityType()

      const { chartAnnotation, slicers, limit, chartOptions } = transformCopilotChart(answer.chart, entityType)
      const _slicers = (answer.slicers || slicers)?.map((slicer) => tryFixSlicer(slicer, entityType))
      const chartTypes = [
        {
          name: '线图',
          type: NxChartType.Line,
          orient: ChartOrient.vertical,
          chartOptions: {
            legend: {
              show: true
            }
          }
        },
        {
          name: '柱形图',
          type: NxChartType.Bar,
          orient: ChartOrient.vertical,
          chartOptions: {
            legend: {
              show: true
            }
          }
        },
        {
          name: '条形图',
          type: NxChartType.Bar,
          orient: ChartOrient.horizontal,
          chartOptions: {
            legend: {
              show: true
            }
          }
        },
        {
          name: '饼图',
          type: NxChartType.Pie,
          variant: PieVariant.None,
          chartOptions: {
            seriesStyle: {
              __showitemStyle__: true,
              itemStyle: {
                borderColor: 'white',
                borderWidth: 1,
                borderRadius: 10
              }
            },
            __showlegend__: true,
            legend: {
              type: 'scroll',
              orient: 'vertical',
              right: 0,
              align: 'right'
            }
          }
        }
      ]
      const index = chartTypes.findIndex(
        ({ type, orient }) => type === chartAnnotation.chartType.type && orient === chartAnnotation.chartType.orient
      )
      if (index > -1) {
        chartAnnotation.chartType = chartTypes.splice(index, 1)[0]
      }

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
            chartSettings: {
              chartTypes,
              universalTransition: true
            },
            slicers: _slicers
          } as Partial<QuestionAnswer>,
          answer.conclusion
        ].filter(Boolean)
      )

      return `Chart answer is created!`
    }
  })

  return createFormulaTool
}
