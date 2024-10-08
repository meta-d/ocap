import { inject } from '@angular/core'
import { tool } from '@langchain/core/tools'
import { nanoid } from '@metad/copilot'
import { NxChartType } from '@metad/core'
import {
  ChartAnnotation,
  ChartOrient,
  DataSettings,
  getDefaultSlicersForVariables,
  getEntityDimensions,
  ISlicer,
  Measure,
  OrderBy,
  PieVariant,
  TimeRangesSlicer,
  tryFixSlicer,
  VariableEntryType
} from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { ChatbiService } from '../chatbi.service'
import { QuestionAnswer } from '../types'
import { completeTableDimension, completeTableMeasure, transformCopilotChart, transformCopilotKpi } from './copilot'
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
          appendToBody: true,
          trigger: 'axis'
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
          appendToBody: true,
          trigger: 'axis'
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
          appendToBody: true,
          trigger: 'axis'
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

  return tool(
    async (answer) => {
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

        // Fix sap variables
        if (!finalAnswer.variables?.length) {
          finalAnswer.variables = getDefaultSlicersForVariables(entityType, VariableEntryType.Required)
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
        } else if (answer.dimensions?.length) {
          finalAnswer.visualType = 'table'
          finalAnswer.chartAnnotation = {
            dimensions: answer.dimensions?.map((d) => completeTableDimension(d, entityType)),
            measures: answer.measures?.map((m) => completeTableMeasure(m as Measure, entityType)),
          } as ChartAnnotation
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
          slicers.push(
            ...chatbiService.answer().timeSlicers.map((slicer) => ({
              ...slicer,
              currentDate: 'TODAY'
            }))
          )
        }

        chatbiService.appendAiMessageData(
          [
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
                  }))
                }
              } as DataSettings,
              chartOptions: chatbiService.answer().chartOptions,
              chartSettings: chatbiService.answer().chartSettings,
              kpi: chatbiService.answer().kpi,
              slicers: slicers.length ? slicers : null,
              orders: chatbiService.answer().orders,
              top: chatbiService.answer().top,
              visualType: chatbiService.answer().visualType
            } as Partial<QuestionAnswer>,
            answer.questions ? {
              questions: answer.questions
            } : null
          ].filter(Boolean)
        )

        return `The answer is created!`
      } catch (err: any) {
        console.log(err)
        return `Error: ${err.message}`
      }
    },
    {
      name: 'answerQuestion',
      description: 'Create chart answer for the question',
      schema: ChatAnswerSchema
    }
  )
}
