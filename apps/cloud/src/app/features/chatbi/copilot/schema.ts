import { makeChartEnum } from '@metad/core'
import {
  ChartMeasureSchema,
  DataSettingsSchema,
  DimensionSchema,
  OrderBySchema,
  SlicerSchema,
  TimeSlicerSchema
} from '@metad/ocap-core'
import { EChartsOptions } from '@metad/story/story'
import { z } from 'zod'

export const SuggestsSchema = z.object({
  suggests: z.array(z.string().describe('The suggested prompt')).describe('The suggested prompts').nonempty()
})

const ChartTypes = makeChartEnum()
export const ChatAnswerSchema = z.object({
  preface: z.string().describe('preface of the answer'),
  dataSettings: DataSettingsSchema.optional().describe('The data settings of the widget'),
  chartType: z
    .object({
      type: z.enum(ChartTypes as unknown as z.EnumValues).describe('The chart type'),
      chartOptions: EChartsOptions.optional()
    })
    .optional()
    .describe('Chart configuration'),
  dimensions: z.array(DimensionSchema).optional().describe('The dimensions used by the chart'),
  measures: z.array(ChartMeasureSchema).optional().describe('The measures used by the chart'),
  orders: z.array(OrderBySchema).optional().describe('The orders used by the chart'),
  top: z.number().optional().describe('The number of top members'),
  slicers: z.array(SlicerSchema).optional().describe('The slicers to filter data'),
  timeSlicers: z.array(TimeSlicerSchema).optional().describe('The time slicers to filter data'),
  variables: z.array(SlicerSchema).optional().describe('The variables to the query of cube'),
  conclusion: z.string().optional().describe('conclusion of the answer')
})
