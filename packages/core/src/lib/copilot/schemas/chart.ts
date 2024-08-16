import { z } from 'zod'
import { baseDimensionSchema, BaseMeasureSchema } from './common'
import { ChartDimensionRoleType } from '../../annotations'

export const ChartDimensionSchema = z.object({
    ...baseDimensionSchema,
    role: z.enum([null, ChartDimensionRoleType.Stacked, ChartDimensionRoleType.Group]).optional().describe('Role of category axis')
})

export const ChartMeasureSchema = z.object({
    ...BaseMeasureSchema,
    role: z.enum([null, 'Axis1', 'Axis2']).optional().describe('Role of value axis')
})