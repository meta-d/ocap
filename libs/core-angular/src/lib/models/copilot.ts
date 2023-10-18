import { C_MEASURES, EntityType, getEntityDimensions, getEntityMeasures } from '@metad/ocap-core'
import { z } from 'zod'


export function calcEntityTypePrompt(entityType: EntityType) {
  return JSON.stringify({
    name: entityType.name,
    caption: entityType.caption,
    dimensions: getEntityDimensions(entityType).map((dimension) => ({
      name: dimension.name,
      caption: dimension.caption,
      hierarchies: dimension.hierarchies?.map((item) => ({
        name: item.name,
        caption: item.caption,
        levels: item.levels?.map((item) => ({
          name: item.name,
          caption: item.caption
        }))
      }))
    })),
    measures: getEntityMeasures(entityType).map((item) => ({
      name: item.name,
      caption: item.caption
    }))
  })
}

export const DimensionSchema = z.object({
  dimension: z.string().describe('The name of the dimension like [Product]'),
  hierarchy: z.string().optional().describe('The name of the hierarchy of the dimension'),
  level: z.string().optional().describe('The name of the level in the hierarchy'),
})

export const MeasureSchema = z.object({
  dimension: z.enum([C_MEASURES]),
  measure: z.string().describe('The name of the measure'),
  order: z.enum(['ASC', 'DESC']).optional().describe('The order of the measure'),
  chartOptions: z.any().optional().describe('The chart options of ECharts library')
})
