import { IndicatorType } from '@metad/ocap-core'
import { z } from 'zod'
import { SlicerSchema } from './cube.schema'

/**
 * z.ZodType<Partial<Indicator>>
 */
export const IndicatorSchema = z
  .object({
    code: z.string().describe(`The code of indicator, use alphabetic characters`),
    name: z.string().describe(`The name of indicator`),
    type: z
      .enum([IndicatorType.BASIC, IndicatorType.DERIVE])
      .describe(`BASIC: is basic indicator, DERIVE: is derived indicator using formula to calculate result`),
    modelId: z.string().describe(`The model id that indicator belongs to`),
    entity: z.string().describe(`The cube name that indicator belongs to`),
    calendar: z.string().describe(`The calendar dimension or hierarchy`),
    dimensions: z
      .array(z.string().describe('Dimension or hierarchy'))
      .describe('The dimensions that not restricted by filters'),
    filters: z.array(SlicerSchema).optional().describe('The filters to restrict the indicator'),
    measure: z.string().describe(`Measure name when indicator type is 'BASIC'`),
    formula: z.string().optional().describe(`MDX formula when indicator type is 'DERIVE'`),
    unit: z.string().optional().describe(`The unit of indicator`),
    isApplication: z.boolean().optional().describe(`The indicator can be show in indicator application if it has calendar dimension`),
  })
  .describe('Indicator')
