import { C_MEASURES, OrderDirection } from '@metad/ocap-core'
import { z } from 'zod'

export function makeCubeRulesPrompt() {
  return `The dimensions consist of three attributes: dimension, hierarchy, and level, each of which is taken from the name of dimension, hierarchy, and level in the cube, respectively.
Dimension name pattern: [Dimension Name];
Hierarchy name pattern: [Hierarchy Name];
Level name pattern: [Hierarchy Name].[Level Name];`
}

export const DimensionSchema = z.object({
  dimension: z.string().describe('The name of the dimension using pattern `[Dimension Name]`'),
  hierarchy: z
    .string()
    .optional()
    .describe('The name of the hierarchy of the dimension using pattern `[Hierarchy Name]`'),
  level: z
    .string()
    .optional()
    .describe('The name of the level in the hierarchy using pattern `[Hierarchy Name].[Level Name]`')
})

export const MeasureSchema = z.object({
  dimension: z.enum([C_MEASURES]),
  measure: z.string().describe('The name of the measure'),
  order: z.enum([OrderDirection.ASC, OrderDirection.DESC]).optional().describe('The order of the measure'),
  chartOptions: z.any().optional().describe('The chart options of ECharts library')
})
