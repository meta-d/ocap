import { inject } from '@angular/core'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { nanoid } from '@metad/copilot'
import { NxChartType, tryFixSlicer } from '@metad/core'
import { assignDeepOmitBlank, ChartOrient, DataSettings, getEntityDimensions, ISlicer, OrderBy, PieVariant, TimeRangesSlicer } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { z } from 'zod'
import { ChatbiService } from '../chatbi.service'
import { QuestionAnswer } from '../types'
import { transformCopilotChart, transformCopilotKpi } from './copilot'
import { ChatAnswerSchema } from './schema'

export function injectCreateChartTool() {
  const logger = inject(NGXLogger)
  const chatbiService = inject(ChatbiService)
  const translate = inject(TranslateService)

  const CHART_TYPES = [
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

  const answerTool = new DynamicStructuredTool({
    name: 'answerQuestion',
    description: 'Create chart answer for the question',
    schema: ChatAnswerSchema,
    func: async (answer) => {
      logger.debug(`Execute copilot action 'answerQuestion':`, answer)
      try {

        const entityType = chatbiService.entityType()
        const finalAnswer = {} as QuestionAnswer
        if (answer.dataSettings) {
          finalAnswer.dataSettings = answer.dataSettings as DataSettings
        }
        if (answer.variables) {
          finalAnswer.variables = answer.variables as ISlicer[]
        }
        if (answer.slicers) {
          finalAnswer.slicers = answer.slicers.map((slicer: any) => tryFixSlicer(slicer, entityType))
        }
        if (answer.timeSlicers) {
          finalAnswer.timeSlicers = answer.timeSlicers as TimeRangesSlicer[]
        }
        if (answer.orders) {
          finalAnswer.orders = answer.orders as OrderBy[]
        }
        
        if (answer.chartType) {
          const { chartAnnotation, chartOptions } = transformCopilotChart(answer, entityType)
          const chartTypes = [...CHART_TYPES]
          const index = chartTypes.findIndex(
            ({ type, orient }) => type === chartAnnotation.chartType.type && orient === chartAnnotation.chartType.orient
          )
          if (index > -1) {
            chartAnnotation.chartType = chartTypes.splice(index, 1)[0]
          }
          finalAnswer.chartAnnotation = chartAnnotation
          finalAnswer.chartOptions = chartOptions
          finalAnswer.chartSettings = {
            chartTypes,
            universalTransition: true
          }
          finalAnswer.visualType = 'chart'
        } else {
          const { kpi } = transformCopilotKpi(answer, entityType)
          finalAnswer.kpi = kpi
          finalAnswer.visualType = 'kpi'
        }

        chatbiService.updateAnswer(finalAnswer)

        const slicers = []
        if (chatbiService.answer().variables) {
          slicers.push(...chatbiService.answer().variables)
        }
        if (chatbiService.answer().slicers) {
          slicers.push(...chatbiService.answer().slicers)
        }
        if (chatbiService.answer().timeSlicers) {
          slicers.push(...chatbiService.answer().timeSlicers.map((slicer) => ({
            ...slicer,
            currentDate: 'TODAY',
          })))
        }

        chatbiService.appendAiMessageData([
            answer.preface,
            {
              key: nanoid(),
              dataSettings: {
                ...(chatbiService.answer().dataSettings ?? {}),
                chartAnnotation: chatbiService.answer().chartAnnotation,
                presentationVariant: {
                  groupBy: getEntityDimensions(entityType).map((property) => ({
                    dimension: property.name,
                    hierarchy: property.defaultHierarchy,
                    level: null
                  })),
                }
              } as DataSettings,
              chartOptions: chatbiService.answer().chartOptions,
              chartSettings: chatbiService.answer().chartSettings,
              kpi: chatbiService.answer().kpi,
              slicers: slicers.length ? slicers : null,
              orders: chatbiService.answer().orders,
              top: chatbiService.answer().top,
              visualType: chatbiService.answer().visualType,
            } as Partial<QuestionAnswer>,
            answer.conclusion
          ].filter(Boolean))

        return `Chart answer is created!`
      } catch(err: any) {
        return `Error: ${err.message}`
      }
    }
  })

  return answerTool
}

/**
 * Create calculated measure with formula
 */
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
      try {
        const key = nanoid()
        chatbiService.upsertIndicator({ id: key, name, entity: cube, code: name, formula, unit })
        const dataSource = chatbiService.dataSourceName()
        chatbiService.appendAiMessageData([
          {
            dataSettings: {
              dataSource,
              entitySet: cube
            },
            indicators: [key], // indicators snapshot
          }
        ])
        return `The new calculated measure with key '${key}' has been created!`
      } catch(err: any) {
        return `Error: ${err.message}`
      }
    }
  })

  return createFormulaTool
}
