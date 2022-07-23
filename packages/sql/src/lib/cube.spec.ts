import { CalculationProperty, C_MEASURES } from '@metad/ocap-core'
import { buildCubeContext, compileCubeSchema } from './cube'
import { CUBE_SALESORDER, ENTITY_TYPE_SALESORDER, PRODUCT_DIMENSION, SHARED_DIMENSION_TIME } from './mock-data'

describe('SQL Cube', () => {
  beforeAll(() => {
    //
  })

  it('Query Cube', () => {
    expect(
      compileCubeSchema(CUBE_SALESORDER.name, CUBE_SALESORDER, [PRODUCT_DIMENSION, SHARED_DIMENSION_TIME], '')
    ).toEqual(ENTITY_TYPE_SALESORDER)
  })

  it('Build Cube Context', () => {
    const cubeContext = buildCubeContext(
      CUBE_SALESORDER,
      {
        rows: [
          {
            dimension: '[Time]',
            hierarchy: '[Time.Weekly]',
            level: '[Time.Weekly].[Week]'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )
    expect(cubeContext.dimensions[0].levels[0].selectFields).toEqual([
      {
        alias: '[Time.Weekly]',
        columns: [
          {
            table: '[time.weekly]_time_by_day',
            column: 'the_year'
          },
          {
            table: '[time.weekly]_time_by_day',
            column: 'week_of_year'
          }
        ],
        table: '[time.weekly]_time_by_day'
      },
      {
        table: '[time.weekly]_time_by_day',
        cast: 'VARCHAR',
        column: 'week_of_year',
        alias: '[Time.Weekly].[MEMBER_CAPTION]'
      }
    ])
  })

  it('Build cube context with Degenerate dimension', () => {
    const cubeContext = buildCubeContext(
      CUBE_SALESORDER,
      {
        rows: [
          {
            dimension: '[Payment method]',
            hierarchy: '[Payment method]',
            level: '[Payment method].[Payment method]'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )
    expect(cubeContext.dimensions[0].levels[0].selectFields).toEqual([
      {
        alias: '[Payment method]',
        columns: [
          {
            column: 'payment_method',
            table: 'salesorder_sales_fact'
          }
        ],
        table: 'salesorder_sales_fact'
      },
      {
        alias: '[Payment method].[MEMBER_CAPTION]',
        cast: 'VARCHAR',
        column: 'payment_method',
        table: 'salesorder_sales_fact'
      }
    ])
  })

  it('with Calculated Member', () => {
    const cubeContext = buildCubeContext(
      CUBE_SALESORDER,
      {
        rows: [
          {
            dimension: '[Payment method]',
            hierarchy: '[Payment method]',
            level: '[Payment method].[Payment method]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Profit'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )
    expect((cubeContext.measures[0] as unknown as CalculationProperty).calculationType).toEqual('Calculated')
  })
})
