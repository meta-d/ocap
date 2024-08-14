import { z } from 'zod'
import { BaseMeasureSchema } from './common'

export const ChartMeasureSchema = z.object({
    ...BaseMeasureSchema,
    role: z.enum([null, 'Axis1', 'Axis2']).optional().describe('Role of value axis')
})
