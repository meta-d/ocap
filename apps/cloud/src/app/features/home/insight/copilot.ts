import { getChartType } from '@metad/core'
import {
  C_MEASURES,
  ChartAnnotation,
  ChartDimension,
  ChartMeasure,
  DataSettings,
  EntityType,
  ISlicer,
  assignDeepOmitBlank,
  omit
} from '@metad/ocap-core'
import { tryFixDimension } from '@metad/story/story'
import { cloneDeep, upperFirst } from 'lodash-es'
import { z } from 'zod'

export const SuggestsSchema = z.object({
  suggests: z.array(z.string().describe('The suggested prompt')).describe('The suggested prompts')
})

export interface QuestionAnswer {
  key: string
  answering: boolean
  chartOptions: any
  dataSettings: DataSettings
  chartSettings: any
  options?: any
  expanded: boolean
  isCube: boolean
  message: string
  slicers: ISlicer[]
  title: string
}

/**
 * Transform copilot answer to chart annotation
 *
 * @param answer Answer from copilot
 * @param entityType Entity type of the cube
 * @returns
 */
export function transformCopilotChart(answer: any, entityType: EntityType) {
  const chartAnnotation = {} as ChartAnnotation
  if (answer.chartType) {
    chartAnnotation.chartType = assignDeepOmitBlank(
      cloneDeep(getChartType(upperFirst(answer.chartType.type))?.value.chartType),
      omit(answer.chartType, 'type'),
      5
    )
  } else {
    chartAnnotation.chartType = {
      type: 'Bar'
    }
  }

  const dimensions = (answer.dimension ? [answer.dimension] : answer.dimensions) ?? []
  if (dimensions.length === 0) {
    throw new Error('At least one dimension is required.')
  }
  chartAnnotation.dimensions = dimensions.map((dimension) => {
    return {
      ...dimension,
      // Determine dimension attr by hierarchy
      ...tryFixDimension(entityType, dimension),
      zeroSuppression: true,
      chartOptions: {
        dataZoom: {
          type: 'inside'
        }
      }
    } as ChartDimension
  })

  const measures = answer.measure ? [answer.measure] : answer.measures ?? []
  if (measures.length === 0) {
    throw new Error('At least one measure is required.')
  }
  chartAnnotation.measures = measures.map(
    (measure) =>
      ({
        ...measure,
        dimension: C_MEASURES,
        chartOptions: {
          ...(measure.chartOptions ?? {})
          // dataZoom: {
          //   type: 'slider'
          // }
        },
        formatting: {
          shortNumber: true
        },
        palette: {
          name: 'Viridis'
        }
      } as ChartMeasure)
  )

  return {
    chartAnnotation,
    slicers: answer.slicers ?? answer.filters, // 因为过滤器会被翻译成 filters
    limit: answer.limit,
    chartOptions: answer.chartOptions ?? answer.chartType?.chartOptions
  }
}
