import { Indicator, IndicatorType } from '@metad/ocap-core'
import { z } from 'zod'

export const IndicatorSchema: z.ZodType<Partial<Indicator>> = z
  .object({
    code: z.string().describe(`The code of indicator, use alphabetic characters`),
    name: z.string().describe(`The name of indicator`),
    type: z.enum([IndicatorType.BASIC, IndicatorType.DERIVE]).describe(`BASIC: is basic indicator, DERIVE: is derived indicator using formula to calculate result`),
    calendar: z.string().describe(`The calendar dimension or hierarchy`),
    dimensions: z.array(z.string().describe('Dimension or hierarchy')).describe('The dimensions that not restricted by filters'),
    filters: z.array(z.object({
        dimension: z.object({
            dimension: z.string().describe('Dimension of filter'),
        })
    })),
    measure: z.string().describe(`Measure name when indicator type is 'BASIC'`),
    formula: z.string().describe(`MDX formula when indicator type is 'DERIVE'`),
  })
  .describe('Indicator')
