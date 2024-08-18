import { getChartType } from '@metad/core'
import {
  C_MEASURES,
  ChartAnnotation,
  ChartDimension,
  ChartDimensionRoleType,
  ChartMeasure,
  EntityType,
  KPIType,
  assignDeepOmitBlank,
  omit,
  tryFixDimension
} from '@metad/ocap-core'
import { cloneDeep, upperFirst } from 'lodash-es'

/**
 * Transform copilot answer to chart annotation or kpi
 *
 * @param answer Answer from copilot
 * @param entityType Entity type of the cube
 * @returns
 */
export function transformCopilotChart(answer: any, entityType: EntityType) {
  const chartAnnotation = {} as ChartAnnotation

  // Chart type
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

  // Dimensions
  const dimensions: ChartDimension[] = (answer.dimension ? [answer.dimension] : answer.dimensions) ?? []
  if (dimensions.length === 0) {
    throw new Error('At least one dimension is required.')
  }
  // 如果有时间维度则将另外一个维度设置为 series (stacked or group)
  const hasTime = dimensions.some((dimension) => dimension.role === ChartDimensionRoleType.Time)
  if (hasTime) {
    const rest = dimensions.filter((dimension) => dimension.role!== ChartDimensionRoleType.Time)
    if (rest.length) {
      rest[0].role ||= ChartDimensionRoleType.Stacked
    }
  }
  chartAnnotation.dimensions = dimensions.map((dimension) => {
    return {
      // Determine dimension attr by hierarchy
      ...tryFixDimension(dimension, entityType),
      zeroSuppression: true,
      chartOptions: {
        dataZoom: {
          type: 'inside'
        }
      }
    } as ChartDimension
  })

  // Measures
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
    chartOptions: answer.chartOptions ?? answer.chartType?.chartOptions
  }
}

export function transformCopilotKpi(answer: any, entityType: EntityType) {
  const KPIAnnotation = {} as KPIType
  const measures = answer.measure ? [answer.measure] : answer.measures ?? []
  if (measures.length === 0) {
    throw new Error('At least one measure is required.')
  }

  KPIAnnotation.DataPoint = {
    Value: {
      ...measures[0],
      dimension: C_MEASURES,
      formatting: {
        shortNumber: true
      },
    }
  }

  return {
    kpi: KPIAnnotation,
  }
}