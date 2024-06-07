import { DimensionMemberSchema, DimensionSchema } from '@metad/core'
import { AggregationOperations, CompareToEnum } from '@metad/ocap-core'
import { z } from 'zod'

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

export const ConditionalAggregationSchema = z.object({
  __id__: z.string().optional().describe(`Key of the calculation measure`),
  name: z.string().describe(`Name of the calculation measure`),
  caption: z.string().optional().describe(`Caption of the calculation measure`),

  operation: z.enum([null, ...AggregationOperations.map(({value}) => value as string)]).describe(`The operation of conditional aggregation`),
  value: z.number().optional().describe(`The value of aggregation operation, only used for some operations: TopSum(memberSet, value), TopPercent(memberSet, value), TopCount(memberSet, value)`),
  measure: z.string().describe(`The name of measure that aggregation by the dimension members`),
  aggregationDimensions: z.array(DimensionMemberSchema).describe(`The dimensions to aggregation by`),
  useConditionalAggregation: z.boolean().optional().describe(`Use conditional aggregation`),
  conditionalDimensions: z.array(DimensionMemberSchema).optional().describe(`The restricted dimensions for measure`),
  excludeConditions: z.boolean().optional().describe(`Exclude the restricted conditions for measure`)
})

export const VarianceMeasureSchema = z.object({
  __id__: z.string().optional().describe(`Key of the calculation measure`),
  name: z.string().describe(`Name of the calculation measure`),
  caption: z.string().optional().describe(`Caption of the calculation measure`),

  measure: z.object({
    measure: z.string().describe(`The name of the measure`),
  }),
  baseDimension: DimensionSchema.describe(`The base dimension for variance measure, for example: time dimension or version dimension`),
  toB: z.object({
    type: z.enum([CompareToEnum.Lag, CompareToEnum.Lead, CompareToEnum.Parallel, CompareToEnum.Ancestor]).describe(`The type of compare to`),
    value: z.number().optional().describe(`The value of compare to type`)
  }),

  asZero: z.boolean().optional().describe(`As zero if the value is null`),
  asPercentage: z.boolean().optional().describe(`calculate as percentage`),
  directDivide: z.boolean().optional().describe(`Direct divide the value A / B, otherwise (A - B) / B`),
  absBaseValue: z.boolean().optional().describe(`Use absolute value of base value: (A - B) / abs(B)`),
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
