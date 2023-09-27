import { DataSettings, ISlicer } from '@metad/ocap-core';
import { z } from 'zod'

const ChartTypes = ['Bar', 'Column', 'Pie'] as const

export const ChartSchema = z.object({
  cube: z.string().describe('The cube name used by the chart'),
  chartType: z.object({
    type: z.enum(ChartTypes).describe('The chart type'),
    chartOptions: z.object({
        seriesStyle: z.any().describe('The series options of ECharts library'),
        legend: z.any().describe('The legend options of ECharts library'),
        axis: z.any().describe('The axis options of ECharts library'),
        dataZoom: z.any().describe('The dataZoom options of ECharts library'),
        tooltip: z.any().describe('The tooltip options of ECharts library'),
    }).describe('The chart options of ECharts library')
  }),
  dimensions: z
    .array(
      z.object({
        dimension: z.string().describe('The name of the dimension'),
        hierarchy: z.string().optional().describe('The name of the hierarchy in the dimension'),
        level: z.string().optional().describe('The name of the level in the hierarchy'),
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
    .describe('The measures used by the chart'),
  slicers: z.array(
    z.object({
      dimension: z
        .array(
          z.object({
            dimension: z.string().describe('The name of the dimension'),
            hierarchy: z.string().optional().describe('The name of the hierarchy in the dimension'),
            level: z.string().optional().describe('The name of the level in the hierarchy')
          })
        )
        .describe('The dimension of the slicer'),
      members: z.array(
        z.object({
          value: z.string().describe('the key of the member'),
          caption: z.string().describe('the caption of the member')
        })
      ).describe('The members in the slicer')
    })
  ).describe('The slicers used by the chart')
})

export const SuggestsSchema = z.object({
  suggests: z.array(
    z.string().describe('The suggested prompt')
  ).describe('The suggested prompts')
})

export interface QuestionAnswer {
  key: string;
  answering: boolean
  chartOptions: any
  dataSettings: DataSettings
  expanded: boolean
  isCube: boolean
  message: string
  slicers: ISlicer[]
  title: string
}