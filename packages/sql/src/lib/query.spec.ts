import { AggregationRole, C_MEASURES, EntitySemantics } from '@metad/ocap-core'
import { buildCubeContext, compileCubeSchema } from './cube'
import { CUBE_SALESORDER, ENTITY_TYPE_SALESORDER, SHARED_DIMENSION_TIME } from './cube.spec'
import { queryCube, serializeCubeFact, serializeCubeFrom, serializeSelectFields } from './query'

const SalesEntityType = {
  name: 'sales',
  properties: {
    Customer: {
      name: 'Customer',
      role: AggregationRole.dimension,
      dataType: 'string'
    },
    sales: {
      name: 'sales',
      role: AggregationRole.measure,
      dataType: 'number'
    }
  },
  semantics: EntitySemantics.aggregate
}

describe('Serialize SQL', () => {
  beforeAll(() => {
    //
  })

  it('query Dimension from Schema', async () => {
    const query = queryCube(
      { name: 'sales', cubes: [CUBE_SALESORDER], dimensions: [SHARED_DIMENSION_TIME] },
      { rows: [{ dimension: '[Time]' }] },
      ENTITY_TYPE_SALESORDER,
      ''
    )

    expect(query).toEqual(
      "SELECT '(All)' AS `[Time]`, 'All' AS `[Time].[MEMBER_CAPTION]` FROM `sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` GROUP BY 1"
    )
  })

  it('query Dimension and Measure from Schema', async () => {
    const query = queryCube(
      { name: 'sales', cubes: [CUBE_SALESORDER], dimensions: [SHARED_DIMENSION_TIME] },
      {
        rows: [{ dimension: '[Time]' }],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )

    expect(query).toEqual(
      "SELECT '(All)' AS `[Time]`, 'All' AS `[Time].[MEMBER_CAPTION]`, sum(`sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` GROUP BY 1"
    )
  })

  it('query Hierarchy from Schema', async () => {
    const query = queryCube(
      { name: 'sales', cubes: [CUBE_SALESORDER], dimensions: [] },
      {
        rows: [
          {
            dimension: '[Time]',
            hierarchy: '[Time.Weekly]',
            level: '[Time.Weekly].[Year]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )

    expect(query).toEqual(
      "SELECT concat('[', `time_by_day`.`the_year`,']') AS `[Time.Weekly]`, `time_by_day`.`the_year` AS `[Time.Weekly].[MEMBER_CAPTION]`, sum(`sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` GROUP BY `time_by_day`.`the_year`"
    )
  })

  it('query Multi Levels from same Hierarchy', async () => {
    try {
      const query = queryCube(
        { name: 'sales', cubes: [CUBE_SALESORDER], dimensions: [] },
        {
          rows: [
            {
              dimension: '[Time]',
              hierarchy: '[Time.Weekly]',
              level: '[Time.Weekly].[Year]'
            },
            {
              dimension: '[Time]',
              hierarchy: '[Time.Weekly]',
              level: '[Time.Weekly].[Week]'
            }
          ],
          columns: [
            {
              dimension: C_MEASURES,
              measure: 'Sales'
            }
          ]
        },
        ENTITY_TYPE_SALESORDER,
        ''
      )
    } catch (error: any) {
      expect(error.message).toEqual('暂时不能同时查询不同层级')
    }
  })

  it('query Low Level from Hierarchy', async () => {
    const query = queryCube(
      { name: 'sales', cubes: [CUBE_SALESORDER], dimensions: [] },
      {
        rows: [
          {
            dimension: '[Time]',
            hierarchy: '[Time.Weekly]',
            level: '[Time.Weekly].[Week]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )

    expect(query).toEqual(
      "SELECT concat('[', `time_by_day`.`the_year`,'].[',`time_by_day`.`week_of_year`,']') AS `[Time.Weekly]`, `time_by_day`.`week_of_year` AS `[Time.Weekly].[MEMBER_CAPTION]`, sum(`sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` GROUP BY `time_by_day`.`the_year`, `time_by_day`.`week_of_year`"
    )
  })

  it('serializeSelectFields', () => {
    let context = serializeSelectFields(
      {
        rows: [
          {
            dimension: {
              dimension: 'Customer'
            },
            property: SalesEntityType.properties.Customer
          }
        ],
        columns: []
      },
      SalesEntityType
    )
    expect(context.groupbys).toEqual(['`Customer`'])
    expect(context.select).toEqual(['`Customer` AS `Customer`'])
    expect(context.unbookedData).toEqual(['`Customer` IS NOT NULL'])

    context = serializeSelectFields(
      {
        rows: [
          {
            dimension: {
              dimension: 'Customer'
            },
            property: SalesEntityType.properties.Customer
          }
        ],
        columns: [
          {
            dimension: {
              dimension: C_MEASURES,
              measure: 'sales'
            },
            property: SalesEntityType.properties.sales
          }
        ]
      },
      SalesEntityType
    )

    expect(context.groupbys).toEqual(['`Customer`'])
    expect(context.select).toEqual(['SUM(`sales`) AS `sales`', '`Customer` AS `Customer`'])
  })

  it('Query Degenerate dimension', () => {
    const query = queryCube(
      {
        name: 'sales',
        cubes: [CUBE_SALESORDER],
        dimensions: [SHARED_DIMENSION_TIME]
      },
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
            measure: 'Sales'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )

    expect(query).toEqual(
      "SELECT concat('[', `sales_fact`.`payment_method`,']') AS `[Payment method]`, `sales_fact`.`payment_method` AS `[Payment method].[MEMBER_CAPTION]`, sum(`sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `sales_fact` GROUP BY `sales_fact`.`payment_method`"
    )
  })
})

describe('Build Cube', () => {
  it('Build Cube Context', () => {
    const cubeContext = buildCubeContext(
      CUBE_SALESORDER,
      {
        rows: [
          {
            dimension: '[Time]',
            hierarchy: '[Time.Weekly]',
            level: '[Time.Weekly].[Year]'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )
    expect(cubeContext.dimensions[0].selectFields).toEqual([
      {
        alias: '[Time.Weekly]',
        columns: [
          {
            column: 'the_year',
            table: 'time_by_day'
          }
        ],
        table: 'time_by_day'
      },
      {
        alias: '[Time.Weekly].[MEMBER_CAPTION]',
        column: 'the_year',
        table: 'time_by_day'
      }
    ])
  })

  it('serializeCubeFrom', () => {
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
    const statement = serializeCubeFrom(CUBE_SALESORDER, cubeContext.dimensions, '')
    expect(statement).toEqual(
      '`sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id`'
    )
  })

  it('queryCube', () => {
    const statement = queryCube(
      {
        name: 'Sales',
        dimensions: [SHARED_DIMENSION_TIME],
        cubes: [CUBE_SALESORDER]
      },
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

    expect(statement).toEqual(
      "SELECT concat('[', `time_by_day`.`the_year`,'].[',`time_by_day`.`week_of_year`,']') AS `[Time.Weekly]`, `time_by_day`.`week_of_year` AS `[Time.Weekly].[MEMBER_CAPTION]` FROM `sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` GROUP BY `time_by_day`.`the_year`, `time_by_day`.`week_of_year`"
    )
  })

  it('queryCube with Calculated Member', () => {
    const statement = queryCube(
      {
        name: 'Sales',
        dimensions: [SHARED_DIMENSION_TIME],
        cubes: [CUBE_SALESORDER]
      },
      {
        rows: [
          {
            dimension: '[Time]',
            hierarchy: '[Time.Weekly]',
            level: '[Time.Weekly].[Week]'
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

    expect(statement).toEqual(
      "SELECT concat('[', `time_by_day`.`the_year`,'].[',`time_by_day`.`week_of_year`,']') AS `[Time.Weekly]`, `time_by_day`.`week_of_year` AS `[Time.Weekly].[MEMBER_CAPTION]`, SUM(`sales_fact`.`store_sales` - `sales_fact`.`store_cost`) AS `Profit` FROM `sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` GROUP BY `time_by_day`.`the_year`, `time_by_day`.`week_of_year`"
    )
  })

  it('queryCube with All dimension and Measures', () => {
    const statement = queryCube(
      {
        name: 'Sales',
        dimensions: [SHARED_DIMENSION_TIME],
        cubes: [CUBE_SALESORDER]
      },
      {
        rows: [
          {
            dimension: '[Time]',
            hierarchy: '[Time.Weekly]',
            level: '[Time.Weekly].[Week]'
          },
          {
            dimension: '[Product]',
            hierarchy: '[Product]',
            level: '[Product].[Brand Name]'
          },
          {
            dimension: '[Payment method]',
            hierarchy: '[Payment method]',
            level: '[Payment method].[Payment method]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'Sales'
          },
          {
            dimension: C_MEASURES,
            measure: 'Cost'
          },
          {
            dimension: C_MEASURES,
            measure: 'Profit'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )

    expect(statement).toEqual(
      "SELECT concat('[', `time_by_day`.`the_year`,'].[',`time_by_day`.`week_of_year`,']') AS `[Time.Weekly]`, `time_by_day`.`week_of_year` AS `[Time.Weekly].[MEMBER_CAPTION]`, concat('[', `product`.`brand_name`,']') AS `[Product]`, `product`.`brand_name` AS `[Product].[MEMBER_CAPTION]`, concat('[', `sales_fact`.`payment_method`,']') AS `[Payment method]`, `sales_fact`.`payment_method` AS `[Payment method].[MEMBER_CAPTION]`, sum(`sales_fact`.`store_sales`) AS `Sales`, sum(`sales_fact`.`store_cost`) AS `Cost`, SUM(`sales_fact`.`store_sales` - `sales_fact`.`store_cost`) AS `Profit` FROM `sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` INNER JOIN `product` AS `product` ON `sales_fact`.`product_id` = `product`.`product_id` GROUP BY `time_by_day`.`the_year`, `time_by_day`.`week_of_year`, `product`.`brand_name`, `sales_fact`.`payment_method`"
    )
  })

})

describe('Query Cube with Filters', () => {
  it('Build Cube Context with Filters', () => {
    const cubeContext = buildCubeContext(
      CUBE_SALESORDER,
      {
        rows: [
          {
            dimension: '[Time]',
            hierarchy: '[Time.Weekly]',
            level: '[Time.Weekly].[Year]'
          }
        ],
        filters: [
          {
            dimension: {
              dimension: '[Product]'
            },
            members: [
              {
                value: '[Brand 1].[Product 1]'
              }
            ]
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )
    expect(cubeContext.dimensions[0].selectFields).toEqual([
      {
        alias: '[Time.Weekly]',
        columns: [
          {
            column: 'the_year',
            table: 'time_by_day'
          }
        ],
        table: 'time_by_day'
      },
      {
        alias: '[Time.Weekly].[MEMBER_CAPTION]',
        column: 'the_year',
        table: 'time_by_day'
      }
    ])
  })

  it('Build Cube Context with Filters', () => {
    const statement = queryCube(
      {
        name: 'Sales',
        dimensions: [SHARED_DIMENSION_TIME],
        cubes: [CUBE_SALESORDER]
      },
      {
        rows: [
          {
            dimension: '[Time]',
            hierarchy: '[Time.Weekly]',
            level: '[Time.Weekly].[Year]'
          }
        ],
        filters: [
          {
            dimension: {
              dimension: '[Product]'
            },
            members: [
              {
                value: '[Brand 1].[Product 1]'
              }
            ]
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )
    expect(statement).toEqual(
      "SELECT concat('[', `time_by_day`.`the_year`,']') AS `[Time.Weekly]`, `time_by_day`.`the_year` AS `[Time.Weekly].[MEMBER_CAPTION]` FROM `sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` INNER JOIN `product` AS `product` ON `sales_fact`.`product_id` = `product`.`product_id` WHERE (`product`.`brand_name` = 'Brand 1' AND `product`.`product_name` = 'Product 1') GROUP BY `time_by_day`.`the_year`"
    )
  })
})

describe('Hive DB', () => {
  it('serializeCubeFact', () => {
    expect(
      serializeCubeFact(
        {
          name: 'Sales',
          tables: [
            {
              name: 'SalesOrder'
            }
          ]
        },
        'hive'
      )
    ).toEqual('SELECT * FROM `SalesOrder`')
  })

  it('queryCube with Hive', () => {
    const statement = queryCube(
      {
        name: 'Sales',
        dimensions: [SHARED_DIMENSION_TIME],
        cubes: [
          CUBE_SALESORDER
        ]
      },
      {
        rows: [
          {
            dimension: '[time]',
            hierarchy: '[time|weekly]',
            level: '[time|weekly][week]'
          },
          {
            dimension: '[product]',
            hierarchy: '[product]',
            level: '[product][brand name]'
          },
          {
            dimension: '[payment method]',
            hierarchy: '[payment method]',
            level: '[payment method][payment method]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: 'sales'
          },
          {
            dimension: C_MEASURES,
            measure: 'cost'
          },
          {
            dimension: C_MEASURES,
            measure: 'profit'
          }
        ]
      },
      compileCubeSchema(CUBE_SALESORDER.name, CUBE_SALESORDER, [SHARED_DIMENSION_TIME], 'hive'),
      'hive',
      'foodmart'
    )

    expect(statement).toEqual(
      "SELECT concat('[', `time_by_day`.`the_year`,'].[',`time_by_day`.`week_of_year`,']') AS `[time|weekly]`, `time_by_day`.`week_of_year` AS `[time|weekly][member_caption]`, concat('[', `product`.`brand_name`,']') AS `[product]`, `product`.`brand_name` AS `[product][member_caption]`, concat('[', `sales_fact`.`payment_method`,']') AS `[payment method]`, `sales_fact`.`payment_method` AS `[payment method][member_caption]`, sum(`sales_fact`.`store_sales`) AS `sales`, sum(`sales_fact`.`store_cost`) AS `cost`, SUM(`sales_fact`.`store_sales` - `sales_fact`.`store_cost`) AS `profit` FROM `foodmart`.`sales_fact` AS `sales_fact` INNER JOIN `foodmart`.`time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` INNER JOIN `foodmart`.`product` AS `product` ON `sales_fact`.`product_id` = `product`.`product_id` GROUP BY `time_by_day`.`the_year`, `time_by_day`.`week_of_year`, `product`.`brand_name`, `sales_fact`.`payment_method`"
    )
  })
})
