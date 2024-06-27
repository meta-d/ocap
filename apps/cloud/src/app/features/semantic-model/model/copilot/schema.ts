import { MDX, RoleTypeEnum } from '@metad/contracts'
import { DimensionType, Semantics, TimeLevelType } from '@metad/ocap-core'
import { z } from 'zod'

export const CalculatedMeasureSchema = z.object({
  name: z.string().describe('Name of the calculated measure; Name cannot be repeated.'),
  caption: z.string().optional().describe('Caption (short description)'),
  description: z.string().optional().describe('Long description'),
  formula: z.string().describe('MDX expression for the calculated measure in cube'),
  formatting: z.object({
    unit: z.string().optional().describe('Unit of the measure; if this is a ratio measurement, value is `%`'),
    decimal: z.string().optional().describe('The decimal of value when formatting the measure')
  }).optional().describe('The formatting config of this measure')
})

export const HierarchySchema = z.object({
  // __id__: z.string().optional().describe('The id of hierarchy, do not set if this is a new hierarchy'),
  name: z.string().describe('The name of the hierarchy'),
  caption: z.string().describe('The caption of the hierarchy'),
  tables: z.array(
    z.object({
      name: z.string().describe('The name of the dimension table')
      // join: z.object({})
    })
  ).optional(),
  primaryKey: z.string().optional().describe('The primary key of the dimension table'),
  hasAll: z.boolean().describe('Whether the hierarchy has an all level'),
  levels: z
    .array(
      z.object({
        __id__: z.string().optional().describe('The id of the level'),
        name: z.string().describe('The name of the level'),
        caption: z.string().describe('The caption of the level'),
        column: z.string().describe('The column of the level'),
        type: z.enum(['String', 'Integer', 'Numeric', 'Boolean']).optional().describe('The type of the column, must be set if the column type is not string'),

        levelType: z.enum([
          TimeLevelType.TimeYears, 
          TimeLevelType.TimeQuarters,
          TimeLevelType.TimeMonths,
          TimeLevelType.TimeWeeks,
          TimeLevelType.TimeDays,
        ]).optional().describe(`The type of level, such as 'TimeYears', 'TimeMonths', 'TimeDays' if dimension is a time dimension`),

        semantics: z.object({
          semantic: z.enum([
            Semantics['Calendar.Year'], 
            Semantics['Calendar.Quarter'],
            Semantics['Calendar.Month'],
            Semantics['Calendar.Week'],
            Semantics['Calendar.Day'],
          ]).optional().describe(`The semantic of the time level`),
          formatter: z.string().optional().describe(`The formatter of the member key of the time level;
for examples: 'yyyy' for year, '[yyyy].[MM]' for month, '[yyyy].[yyyyMM].[yyyyMMDD]' for day
          `)
        }).optional()
      })
    )
    .describe('An array of levels in this hierarchy')
})

export const DimensionSchema = z.object({
  __id__: z.string().optional().describe('The id of the dimension'),
  name: z.string().describe('The name of the dimension'),
  caption: z.string().describe('The caption of the dimension'),
  type: z.enum([DimensionType.StandardDimension, DimensionType.TimeDimension])
    .optional()
    .describe('The type of the dimension'),
  hierarchies: z.array(HierarchySchema).describe('An array of hierarchies in this dimension')
})

export const CubeSchema = z.object({
  name: z.string().optional().describe('The name of the cube'),
  caption: z.string().optional().describe('The caption of the cube'),
  description: z.string().optional().describe('The description of the cube'),
  tables: z.array(
    z.object({
      name: z.string().describe('The name of the cube fact table')
      // join: z.object({})
    })
  ).optional(),
  defaultMeasure: z.string().optional().describe('The default measure of the cube'),
  measures: z
    .array(
      z.object({
        name: z.string().describe('The name of the measure'),
        caption: z.string().describe('The caption of the measure'),
        column: z.string().describe('The column of the measure'),
        aggregator: z.enum(['sum', 'avg', 'count', 'max', 'min', 'distinct-count']).optional().describe('The aggregator of the measure'),
      })
    )
    .optional()
    .describe('An array of measures in this cube'),
  dimensions: z
    .array(
      DimensionSchema
    )
    .optional()
    .describe('An array of dimensions in this cube'),

  dimensionUsages: z
    .array(
      z.object({
        name: z.string().describe('The name of the dimension usage'),
        caption: z.string().optional().describe('The caption of the dimension usage'),
        source: z.string().describe('The name of the shared dimension'),
        foreignKey: z.string().describe('The foreign key of the fact table that join into the shared dimension'),
        description: z.string().optional().describe('The description of the dimension usage')
      })
    )
    .optional()
    .describe('An array of shared dimensions ref used in this cube'),
    
  calculatedMembers: z.array(CalculatedMeasureSchema).optional().describe('An array of calculated measures in this cube')
})


export const QueryCubeSchema = z.object({
  statement: z.string().describe('The MDX statement of query the cube')
})

export const RoleSchema = z.object({
  name: z.string().describe('The name of role'),
  type: z.enum([RoleTypeEnum.union, RoleTypeEnum.single]).default(RoleTypeEnum.single).describe('The type of role'),

  options: z.object({
    name: z.string().describe('The name of role'),
    schemaGrant: z.object({
      access: z.enum([MDX.Access.all, MDX.Access.custom]).default(MDX.Access.all).describe('The access of role'),
      cubeGrants: z.array(z.object({
        cube: z.string().describe('The name of cube'),
        access: z.enum([MDX.Access.all, MDX.Access.custom, MDX.Access.none]).default(MDX.Access.all).describe('The access of cube'),
        hierarchyGrants: z.array(z.object({
          hierarchy: z.string().describe('The name of hierarchy'),
          access: z.enum([MDX.Access.all, MDX.Access.custom, MDX.Access.none]).default(MDX.Access.all).describe('The access of hierarchy'),
          memberGrants: z.array(z.object({
            member: z.string().describe('The name of member'),
            access: z.enum([MDX.Access.all, MDX.Access.none]).default(MDX.Access.all).describe('The access of member'),
          })).optional()
        })).optional()
      }))
    })
  })
})
