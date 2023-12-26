import { z } from 'zod'

export const CalculatedMeasureSchema = z.object({
  name: z.string().describe('Name of the calculated measure'),
  caption: z.string().optional().describe('Caption of the calculated measure'),
  formula: z.string().describe('MDX expression for the calculated measure in cube')
})

export const HierarchySchema = z.object({
  __id__: z.string().optional().describe('The id of the hierarchy'),
  name: z.string().describe('The name of the hierarchy'),
  caption: z.string().describe('The caption of the hierarchy'),
  tables: z.array(
    z.object({
      name: z.string().describe('The name of the dimension table')
      // join: z.object({})
    })
  ),
  primaryKey: z.string().describe('The primary key of the dimension table'),
  hasAll: z.boolean().describe('Whether the hierarchy has an all level'),
  levels: z
    .array(
      z.object({
        __id__: z.string().optional().describe('The id of the level'),
        name: z.string().describe('The name of the level'),
        caption: z.string().describe('The caption of the level'),
        column: z.string().describe('The column of the level')
      })
    )
    .describe('An array of levels in this hierarchy')
})

export const DimensionSchema = z.object({
  __id__: z.string().optional().describe('The id of the dimension'),
  name: z.string().describe('The name of the dimension'),
  caption: z.string().describe('The caption of the dimension'),
  hierarchies: z.array(HierarchySchema).describe('An array of hierarchies in this dimension')
})

export const QueryCubeSchema = z.object({
  statement: z.string().describe('The MDX statement of query the cube')
})