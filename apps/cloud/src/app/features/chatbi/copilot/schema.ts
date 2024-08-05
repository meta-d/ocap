import { DataSettingsSchema, SlicerSchema } from '@metad/core'
import { ChartSchema } from '@metad/story/story'
import { z } from 'zod'

export const SuggestsSchema = z.object({
  suggests: z.array(z.string().describe('The suggested prompt')).describe('The suggested prompts').nonempty()
})

export const ChatAnswerSchema = z.object({
  preface: z.string().describe('preface of the answer'),
  dataSettings: DataSettingsSchema.optional().describe('The data settings of the widget'),
  chart: ChartSchema.describe('Chart configuration'),
  top: z.number().optional().describe('The number of top members'),
  slicers: z.array(SlicerSchema).optional().describe('The slicers used by the chart data'),
  conclusion: z.string().optional().describe('conclusion of the answer')
})
