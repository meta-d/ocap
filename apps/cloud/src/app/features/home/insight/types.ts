import {
  AggregationRole,
  C_MEASURES,
  ChartAnnotation,
  ChartDimension,
  ChartMeasure,
  DataSettings,
  Dimension,
  EntityType,
  ISlicer,
  getEntityProperty2
} from '@metad/ocap-core'
import { upperFirst } from 'lodash-es'
import { z } from 'zod'

const ChartTypes = ['Bar', 'Column', 'Pie'] as const

export const ChartSchema = z.object({
  cube: z.string().describe('The cube name used by the chart'),
  chartType: z.object({
    type: z.enum(ChartTypes).describe('The chart type'),
    chartOptions: z
      .object({
        seriesStyle: z.any().describe('The series options of ECharts library'),
        legend: z.any().describe('The legend options of ECharts library'),
        axis: z.any().describe('The axis options of ECharts library'),
        dataZoom: z.any().describe('The dataZoom options of ECharts library'),
        tooltip: z.any().describe('The tooltip options of ECharts library')
      })
      .describe('The chart options of ECharts library')
  }),
  dimensions: z
    .array(
      z.object({
        dimension: z.string().describe('The name of dimension'),
        hierarchy: z.string().optional().describe('The name of the hierarchy in the dimension'),
        level: z.string().optional().describe('The name of the level in the hierarchy')
      })
    )
    .describe('The dimensions used by the chart'),
  measures: z
    .array(
      z.object({
        measure: z.string().describe('The name of the measure'),
        order: z.enum(['ASC', 'DESC']).optional().describe('The order of the measure'),
        chartOptions: z.any().optional().describe('The chart options of ECharts library')
      })
    )
    .describe('The measures used by the chart; At least one measure'),
  slicers: z
    .array(
      z.object({
        dimension: z.object({
              dimension: z.string().describe('The name of the dimension'),
              hierarchy: z.string().optional().describe('The name of the hierarchy in the dimension'),
              level: z.string().optional().describe('The name of the level in the hierarchy')
            })
          .describe('The dimension of the slicer'),
        members: z
          .array(
            z.object({
              value: z.string().describe('the key of the member'),
              caption: z.string().describe('the caption of the member')
            })
          )
          .describe('The members in the slicer')
      })
    )
    .describe('The slicers used by the chart')
})

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

export const DemoModelCubes = [
  {
    name: 'Visit',
    caption: '访问',
    dimensions: [
      {
        name: '[Time]',
        caption: '日历',
        hierarchies: [
          {
            name: '[Time]',
            caption: '日历',
            levels: [
              {
                name: '[Time].[Year]',
                caption: '年'
              },
              {
                name: '[Time].[Month]',
                caption: '月'
              },
              {
                name: '[Time].[Day]',
                caption: '日'
              }
            ]
          }
        ]
      },
      {
        name: '[Product]',
        caption: '产品',
        hierarchies: [
          {
            name: '[Product]',
            caption: '产品',
            levels: [
              {
                name: '[Product].[Category]',
                caption: '类别'
              },
              {
                name: '[Product].[Name]',
                caption: '名称'
              }
            ]
          }
        ]
      }
    ],
    measures: [
      {
        name: 'visits',
        caption: '访问量'
      }
    ]
  }
]

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
    chartAnnotation.chartType = {
      ...answer.chartType,
      type: upperFirst(answer.chartType.type)
    }
  } else {
    chartAnnotation.chartType = {
      type: 'Bar'
    }
  }

  const dimensions = (answer.dimension ? [answer.dimension] : answer.dimensions) ?? []
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

/**
 * 由于 AI 返回结果的不稳定，需要尝试修复不同情况的维度
 * 
 * @param entityType 
 * @param dimension 
 * @returns 
 */
export function tryFixDimension(entityType: EntityType, dimension: Dimension) {
  let property = null
  if (dimension.level) {
    property = getEntityProperty2(entityType, dimension.level)
  } else if (dimension.hierarchy) {
    property = getEntityProperty2(entityType, dimension.hierarchy)
  } else if (dimension.dimension) {
    property = getEntityProperty2(entityType, dimension.dimension)
  }

  switch (property?.role) {
    case AggregationRole.dimension:
      return {
        dimension: property.name
      }
    case AggregationRole.hierarchy:
      return {
        dimension: property.dimension,
        hierarchy: property.name
      }
    case AggregationRole.level:
      return {
        dimension: property.dimension,
        hierarchy: property.hierarchy,
        level: property.name
      }
    default:
      throw new Error(`Can't find dimension for '${dimension.hierarchy || dimension.dimension}'`)
  }
}
