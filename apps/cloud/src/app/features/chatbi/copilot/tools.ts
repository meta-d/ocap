import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { nanoid } from '@metad/copilot'
import { NxChartType, tryFixSlicer } from '@metad/core'
import { ChartOrient, DataSettings, getEntityDimensions, PieVariant } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { z } from 'zod'
import { ChatbiService } from '../chatbi.service'
import { QuestionAnswer } from '../types'
import { transformCopilotChart } from './copilot'
import { ChatAnswerSchema } from './schema'

export function injectCreateChartTool() {
  const logger = inject(NGXLogger)
  const chatbiService = inject(ChatbiService)
  const translate = inject(TranslateService)

  const answerTool = new DynamicStructuredTool({
    name: 'answerQuestion',
    description: 'Create chart answer for the question',
    schema: ChatAnswerSchema,
    func: async (answer) => {
      logger.debug(`Execute copilot action 'answerQuestion':`, answer)

      const entityType = chatbiService.entityType()

      const { chartAnnotation, slicers, chartOptions } = transformCopilotChart(answer.chart, entityType)
      const _slicers = (answer.slicers || slicers)?.map((slicer) => tryFixSlicer(slicer, entityType))
      const chartTypes = [
        {
          name: translate.instant('PAC.ChatBI.Chart_Line', { Default: 'Line' }),
          type: NxChartType.Line,
          orient: ChartOrient.vertical,
          chartOptions: {
            legend: {
              show: true
            },
            tooltip: {
              appendToBody: true
            }
          }
        },
        {
          name: translate.instant('PAC.ChatBI.Chart_Column', { Default: 'Column' }),
          type: NxChartType.Bar,
          orient: ChartOrient.vertical,
          chartOptions: {
            legend: {
              show: true
            },
            tooltip: {
              appendToBody: true
            }
          }
        },
        {
          name: translate.instant('PAC.ChatBI.Chart_Bar', { Default: 'Bar' }),
          type: NxChartType.Bar,
          orient: ChartOrient.horizontal,
          chartOptions: {
            legend: {
              show: true
            },
            tooltip: {
              appendToBody: true
            }
          }
        },
        {
          name: translate.instant('PAC.ChatBI.Chart_Pie', { Default: 'Pie' }),
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
            },
            tooltip: {
              appendToBody: true
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
                maxItems: answer.top,
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

  return answerTool
}

export function injectCreateFormulaTool() {
  const logger = inject(NGXLogger)
  const chatbiService = inject(ChatbiService)

  const createFormulaTool = new DynamicStructuredTool({
    name: 'createFormula',
    description: 'Create formula for new measure',
    schema: z.object({
      cube: z.string().describe('The cube name'),
      name: z.string().describe('The name of calculated measure'),
      formula: z.string().describe('The MDX formula for calculated measure'),
      unit: z.string().optional().describe('The unit of measure')
    }),
    func: async ({ cube, name, formula, unit }) => {
      logger.debug(`Execute copilot action 'createFormula':`, cube, name, formula, unit)

      chatbiService.addIndicator({ id: nanoid(), name, entity: cube, code: name, formula, unit })

      return `The new calculated measure has been created!`
    }
  })
  return createFormulaTool
}
