import { z } from 'zod'
import { MemberSchema } from './cube.schema'
import { TimeGranularity, TimeRangeType } from '@metad/ocap-core'

export const SlicerSchema = z.object({
  dimension: z
    .object({
      dimension: z.string().describe('The name of the dimension'),
      hierarchy: z.string().optional().describe('The name of the hierarchy in the dimension'),
      level: z.string().optional().describe('The name of the level in the hierarchy'),
      parameter: z.string().optional().describe('The name of variable reference to')
    })
    .describe('dimension of the slicer'),
  members: z.array(MemberSchema).describe('Members in the slicer')
})
export const VariableSchema = z.object({
  variable: z.string().describe('The name of the variable')
})

export const TimeSlicerSchema = z.object({
  dimension: z
    .object({
      dimension: z.string().describe('The name of the dimension'),
      hierarchy: z.string().optional().describe('The name of the hierarchy in the dimension')
    })
    .describe('the time dimension'),
  ranges: z.array(z.object({
    type: z.enum([TimeRangeType.Standard, TimeRangeType.Offset]).describe('The type of time range'),
    granularity: z.enum([TimeGranularity.Year, TimeGranularity.Quarter, TimeGranularity.Month, TimeGranularity.Week, TimeGranularity.Day]).describe('The granularity of the time range'),
    lookBack: z.number().optional().describe('The look back period in granularity'),
    lookAhead: z.number().optional().describe('The look ahead period in granularity')
  }))
})
