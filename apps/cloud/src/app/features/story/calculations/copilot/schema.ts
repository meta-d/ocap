import { DimensionMemberSchema, markdownEntityType } from '@metad/core'
import { ENTITY_TYPE_SALESORDER } from '@metad/ocap-sql'
import { z } from 'zod'

export const CalculationSchema = z.object({
  __id__: z.string().optional().describe(`Key of the calculation measure`),
  name: z.string().optional().describe(`Name of the calculation measure`),
  caption: z.string().optional().describe(`Caption of the calculation measure`),
  formula: z.string().optional().describe(`MDX Formula of the calculated measure`)
})

/**
 * For {@link RestrictedMeasureProperty | restricted measure property}
 */
export const RestrictedMeasureSchema = z.object({
  __id__: z.string().optional().describe(`Key of the calculation measure`),
  name: z.string().optional().describe(`Name of the calculation measure`),
  caption: z.string().optional().describe(`Caption of the calculation measure`),
  measure: z.string().optional().describe(`The name of measure that restricted by the dimension members`),

  dimensions: z.array(DimensionMemberSchema),

  // slicers: z.array(SlicerSchema).optional().describe(`The slicers to restrict the calculation measure`),
  enableConstantSelection: z.boolean().optional().describe(`Enable constant selection of restricted measure`)
})

export const RestrictedMeasureBikes = {
  measure: 'Sales',
  dimensions: [
    {
      dimension: '[Product]',
      hierarchy: '[Product.Category]',
      members: [
        {
          key: '[Bikes]'
        }
      ]
    }
  ],
  enableConstantSelection: true
  // slicers: [
  //   {
  //     dimension: { dimension: '[Product]' },
  //     members: [
  //       {
  //         key: '[Product].[Bikes]'
  //       }
  //     ]
  //   }
  // ]
}

export const CalculationExamples = [
  {
    input: 'Sales amount of product category bikes',
    ai: `think: call 'dimensionMemberKeySearch' tool query with param 'product category bikes' to get member key of 'product category bikes' in dimension 'product category'
ai: create a restricted measure with params ${JSON.stringify(RestrictedMeasureBikes).replace(/\{/g, '{{').replace(/\}/g, '}}')} named 'Sales of Bikes'
`
  },
  {
    input: `YoY of Sales amount of the product category 'bikes'`,
    ai: `think: call 'dimensionMemberKeySearch' tool query with param 'product category bikes' to get member key of 'product category bikes' in dimension 'product category'
ai: create a formula like 'IIF(
  NOT [Date].[Year].CurrentMember.PrevMember IS NULL,
  ([Measures].[Sales] - ([Date].[Year].CurrentMember.PrevMember, [Measures].[Sales])) 
    / ([Date].[Year].CurrentMember.PrevMember, [Measures].[Sales]),
  NULL
)' named 'Sales YoY of Bikes'`
  }
]

export const CalcExamples = `The cube info is:

${markdownEntityType(ENTITY_TYPE_SALESORDER)}

${CalculationExamples.map(({ input, ai }) => `qustion: '${input}\n${ai}`).join('\n\n')}
`
