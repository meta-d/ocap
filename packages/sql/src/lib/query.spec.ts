import { AggregationRole, C_MEASURES, EntitySemantics } from '@metad/ocap-core'
import { buildCubeContext, compileCubeSchema } from './cube'
import { CUBE_SALESORDER, ENTITY_TYPE_SALESORDER, PRODUCT_DIMENSION, SHARED_DIMENSION_TIME } from './mock-data'
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
    const { statement } = queryCube(
      { name: 'sales', cubes: [CUBE_SALESORDER], dimensions: [SHARED_DIMENSION_TIME] },
      { rows: [{ dimension: '[Time]' }] },
      ENTITY_TYPE_SALESORDER,
      ''
    )

    expect(statement).toEqual(
      "SELECT '(All)' AS `[Time]`, 'All' AS `[Time].[MEMBER_CAPTION]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time]_time_by_day`.`time_id` GROUP BY 1"
    )
  })

  it('query Dimension and Measure from Schema', async () => {
    const { statement } = queryCube(
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

    expect(statement).toEqual(
      "SELECT '(All)' AS `[Time]`, 'All' AS `[Time].[MEMBER_CAPTION]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time]_time_by_day`.`time_id` GROUP BY 1"
    )
  })

  it('query Hierarchy from Schema', async () => {
    const { statement } = queryCube(
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

    expect(statement).toEqual(
      "SELECT concat('[', CASE WHEN `[time.weekly]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time.weekly]_time_by_day`.`the_year` AS VARCHAR) END,']') AS `[Time.Weekly]`, CAST(`[time.weekly]_time_by_day`.`the_year` AS VARCHAR) AS `[Time.Weekly].[MEMBER_CAPTION]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time.weekly]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time.weekly]_time_by_day`.`time_id` GROUP BY `[time.weekly]_time_by_day`.`the_year`"
    )
  })

  it('query Multi Levels from same Hierarchy', async () => {
    try {
      const { statement } = queryCube(
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
    const { statement } = queryCube(
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

    expect(statement).toEqual(
      "SELECT concat('[', CASE WHEN `[time.weekly]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time.weekly]_time_by_day`.`the_year` AS VARCHAR) END,'].[',CASE WHEN `[time.weekly]_time_by_day`.`week_of_year` IS NULL THEN '#' ELSE CAST(`[time.weekly]_time_by_day`.`week_of_year` AS VARCHAR) END,']') AS `[Time.Weekly]`, CAST(`[time.weekly]_time_by_day`.`week_of_year` AS VARCHAR) AS `[Time.Weekly].[MEMBER_CAPTION]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time.weekly]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time.weekly]_time_by_day`.`time_id` GROUP BY `[time.weekly]_time_by_day`.`the_year`, `[time.weekly]_time_by_day`.`week_of_year`"
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
    const { statement } = queryCube(
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

    expect(statement).toEqual(
      "SELECT concat('[', CASE WHEN `salesorder_sales_fact`.`payment_method` IS NULL THEN '#' ELSE CAST(`salesorder_sales_fact`.`payment_method` AS VARCHAR) END,']') AS `[Payment method]`, CAST(`salesorder_sales_fact`.`payment_method` AS VARCHAR) AS `[Payment method].[MEMBER_CAPTION]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` GROUP BY `salesorder_sales_fact`.`payment_method`"
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
    expect(cubeContext.dimensions[0].levels[0].selectFields).toEqual([
      {
        alias: '[Time.Weekly]',
        columns: [
          {
            column: 'the_year',
            table: '[time.weekly]_time_by_day'
          }
        ],
        table: '[time.weekly]_time_by_day'
      },
      {
        alias: '[Time.Weekly].[MEMBER_CAPTION]',
        cast: 'VARCHAR',
        column: 'the_year',
        table: '[time.weekly]_time_by_day'
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
    const statement = serializeCubeFrom(cubeContext, '')
    expect(statement).toEqual(
      '`sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time.weekly]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time.weekly]_time_by_day`.`time_id`'
    )
  })

  it('queryCube', () => {
    const { statement } = queryCube(
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
      "SELECT concat('[', CASE WHEN `[time.weekly]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time.weekly]_time_by_day`.`the_year` AS VARCHAR) END,'].[',CASE WHEN `[time.weekly]_time_by_day`.`week_of_year` IS NULL THEN '#' ELSE CAST(`[time.weekly]_time_by_day`.`week_of_year` AS VARCHAR) END,']') AS `[Time.Weekly]`, CAST(`[time.weekly]_time_by_day`.`week_of_year` AS VARCHAR) AS `[Time.Weekly].[MEMBER_CAPTION]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time.weekly]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time.weekly]_time_by_day`.`time_id` GROUP BY `[time.weekly]_time_by_day`.`the_year`, `[time.weekly]_time_by_day`.`week_of_year`"
    )
  })

  it('queryCube with Calculated Member', () => {
    const { statement } = queryCube(
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
      "SELECT concat('[', CASE WHEN `[time.weekly]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time.weekly]_time_by_day`.`the_year` AS VARCHAR) END,'].[',CASE WHEN `[time.weekly]_time_by_day`.`week_of_year` IS NULL THEN '#' ELSE CAST(`[time.weekly]_time_by_day`.`week_of_year` AS VARCHAR) END,']') AS `[Time.Weekly]`, CAST(`[time.weekly]_time_by_day`.`week_of_year` AS VARCHAR) AS `[Time.Weekly].[MEMBER_CAPTION]`, SUM(`sales_fact`.`store_sales` - `sales_fact`.`store_cost`) AS `Profit` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time.weekly]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time.weekly]_time_by_day`.`time_id` GROUP BY `[time.weekly]_time_by_day`.`the_year`, `[time.weekly]_time_by_day`.`week_of_year`"
    )
  })

  it('queryCube with All dimension and Measures', () => {
    const { statement } = queryCube(
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
      "SELECT concat('[', CASE WHEN `[time.weekly]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time.weekly]_time_by_day`.`the_year` AS VARCHAR) END,'].[',CASE WHEN `[time.weekly]_time_by_day`.`week_of_year` IS NULL THEN '#' ELSE CAST(`[time.weekly]_time_by_day`.`week_of_year` AS VARCHAR) END,']') AS `[Time.Weekly]`, CAST(`[time.weekly]_time_by_day`.`week_of_year` AS VARCHAR) AS `[Time.Weekly].[MEMBER_CAPTION]`, concat('[', CASE WHEN `[product]_product`.`brand_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`brand_name` AS VARCHAR) END,']') AS `[Product]`, CAST(`[product]_product`.`brand_name` AS VARCHAR) AS `[Product].[MEMBER_CAPTION]`, concat('[', CASE WHEN `salesorder_sales_fact`.`payment_method` IS NULL THEN '#' ELSE CAST(`salesorder_sales_fact`.`payment_method` AS VARCHAR) END,']') AS `[Payment method]`, CAST(`salesorder_sales_fact`.`payment_method` AS VARCHAR) AS `[Payment method].[MEMBER_CAPTION]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales`, sum(`salesorder_sales_fact`.`store_cost`) AS `Cost`, SUM(`sales_fact`.`store_sales` - `sales_fact`.`store_cost`) AS `Profit` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time.weekly]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time.weekly]_time_by_day`.`time_id` INNER JOIN `product` AS `[product]_product` ON `salesorder_sales_fact`.`product_id` = `[product]_product`.`product_id` GROUP BY `[time.weekly]_time_by_day`.`the_year`, `[time.weekly]_time_by_day`.`week_of_year`, `[product]_product`.`brand_name`, `salesorder_sales_fact`.`payment_method`"
    )
  })

  it('queryCube with Two dimensions has same table', () => {
    const { statement } = queryCube(
      {
        name: 'Sales',
        dimensions: [PRODUCT_DIMENSION, SHARED_DIMENSION_TIME],
        cubes: [CUBE_SALESORDER]
      },
      {
        rows: [
          {
            dimension: '[Product]'
          },
          {
            dimension: '[Product Class]'
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

    expect(statement).toEqual(
      "SELECT '(All)' AS `[Product]`, 'All' AS `[Product].[MEMBER_CAPTION]`, concat('[', CASE WHEN `[product_class]_product_type`.`product_type_id` IS NULL THEN '#' ELSE CAST(`[product_class]_product_type`.`product_type_id` AS VARCHAR) END,']') AS `[Product Class]`, CAST(`[product_class]_product_type`.`product_type_id` AS VARCHAR) AS `[Product Class].[MEMBER_CAPTION]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `product` AS `[product]_product` ON `salesorder_sales_fact`.`product_id` = `[product]_product`.`product_id` INNER JOIN (`product` AS `[product_class]_product` Left JOIN `product_class` AS `[product_class]_product_class` ON `[product_class]_product`.`product_class_id` = `[product_class]_product_class`.`product_class_id` Left JOIN `product_type` AS `[product_class]_product_type` ON `[product_class]_product_class`.`product_type_id` = `[product_class]_product_type`.`product_type_id`) ON `salesorder_sales_fact`.`product_id` = `[product_class]_product`.`product_id` GROUP BY `[product_class]_product_type`.`product_type_id`"
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
    expect(cubeContext.dimensions[0].levels[0].selectFields).toEqual([
      {
        alias: '[Time.Weekly]',
        columns: [
          {
            column: 'the_year',
            table: '[time.weekly]_time_by_day'
          }
        ],
        table: '[time.weekly]_time_by_day'
      },
      {
        alias: '[Time.Weekly].[MEMBER_CAPTION]',
        cast: 'VARCHAR',
        column: 'the_year',
        table: '[time.weekly]_time_by_day'
      }
    ])
  })

  it('Build Cube Context with Filters', () => {
    const { statement } = queryCube(
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
      "SELECT concat('[', CASE WHEN `[time.weekly]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time.weekly]_time_by_day`.`the_year` AS VARCHAR) END,']') AS `[Time.Weekly]`, CAST(`[time.weekly]_time_by_day`.`the_year` AS VARCHAR) AS `[Time.Weekly].[MEMBER_CAPTION]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time.weekly]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time.weekly]_time_by_day`.`time_id` INNER JOIN `product` AS `[product]_product` ON `salesorder_sales_fact`.`product_id` = `[product]_product`.`product_id` WHERE (`[product]_product`.`brand_name` = 'Brand 1' AND `[product]_product`.`product_name` = 'Product 1') GROUP BY `[time.weekly]_time_by_day`.`the_year`"
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
          ],
          defaultMeasure: ''
        },
        'hive'
      )
    ).toEqual('SELECT * FROM `SalesOrder`')
  })

  it('queryCube with Hive', () => {
    const { statement } = queryCube(
      {
        name: 'Sales',
        dimensions: [PRODUCT_DIMENSION, SHARED_DIMENSION_TIME],
        cubes: [CUBE_SALESORDER]
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
      compileCubeSchema(CUBE_SALESORDER.name, CUBE_SALESORDER, [PRODUCT_DIMENSION, SHARED_DIMENSION_TIME], 'hive'),
      'hive',
      'foodmart'
    )

    expect(statement).toEqual(
      "SELECT concat('[', CASE WHEN `[time|weekly]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time|weekly]_time_by_day`.`the_year` AS VARCHAR) END,'].[',CASE WHEN `[time|weekly]_time_by_day`.`week_of_year` IS NULL THEN '#' ELSE CAST(`[time|weekly]_time_by_day`.`week_of_year` AS VARCHAR) END,']') AS `[time|weekly]`, CAST(`[time|weekly]_time_by_day`.`week_of_year` AS VARCHAR) AS `[time|weekly][member_caption]`, concat('[', CASE WHEN `[product]_product`.`brand_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`brand_name` AS VARCHAR) END,']') AS `[product]`, CAST(`[product]_product`.`brand_name` AS VARCHAR) AS `[product][member_caption]`, concat('[', CASE WHEN `salesorder_sales_fact`.`payment_method` IS NULL THEN '#' ELSE CAST(`salesorder_sales_fact`.`payment_method` AS VARCHAR) END,']') AS `[payment method]`, CAST(`salesorder_sales_fact`.`payment_method` AS VARCHAR) AS `[payment method][member_caption]`, sum(`salesorder_sales_fact`.`store_sales`) AS `sales`, sum(`salesorder_sales_fact`.`store_cost`) AS `cost`, SUM(`sales_fact`.`store_sales` - `sales_fact`.`store_cost`) AS `profit` FROM `foodmart`.`sales_fact` AS `salesorder_sales_fact` INNER JOIN `foodmart`.`time_by_day` AS `[time|weekly]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time|weekly]_time_by_day`.`time_id` INNER JOIN `foodmart`.`product` AS `[product]_product` ON `salesorder_sales_fact`.`product_id` = `[product]_product`.`product_id` GROUP BY `[time|weekly]_time_by_day`.`the_year`, `[time|weekly]_time_by_day`.`week_of_year`, `[product]_product`.`brand_name`, `salesorder_sales_fact`.`payment_method`"
    )
  })
})

// ====================================== Dimension display as hierarchy ======================================
describe('Dimension display as hierarchy', () => {
  it('Basic', () => {
    const { statement } = queryCube(
      {
        name: 'Sales',
        dimensions: [PRODUCT_DIMENSION, SHARED_DIMENSION_TIME],
        cubes: [CUBE_SALESORDER]
      },
      {
        rows: [
          {
            dimension: '[Time]',
            level: '[Time].[Year]',
            displayHierarchy: true
          }
        ],
        columns: []
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )

    expect(statement).toEqual(
      "SELECT '(All)' AS `[Time]`, 'All' AS `[Time].[MEMBER_CAPTION]`, '' AS `[Time].[PARENT_UNIQUE_NAME]`, COUNT(DISTINCT concat('[', CASE WHEN `[time]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time]_time_by_day`.`the_year` AS VARCHAR) END,']')) AS `[Time].[CHILDREN_CARDINALITY]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time]_time_by_day`.`time_id` GROUP BY 1 union SELECT concat('[', CASE WHEN `[time]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time]_time_by_day`.`the_year` AS VARCHAR) END,']') AS `[Time]`, CAST(`[time]_time_by_day`.`the_year` AS VARCHAR) AS `[Time].[MEMBER_CAPTION]`, '(All)' AS `[Time].[PARENT_UNIQUE_NAME]`, COUNT(DISTINCT concat('[', CASE WHEN `[time]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time]_time_by_day`.`the_year` AS VARCHAR) END,'].[',CASE WHEN `[time]_time_by_day`.`quarter` IS NULL THEN '#' ELSE CAST(`[time]_time_by_day`.`quarter` AS VARCHAR) END,']')) AS `[Time].[CHILDREN_CARDINALITY]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time]_time_by_day`.`time_id` GROUP BY `[time]_time_by_day`.`the_year`"
    )
  })

  it('Two dimensions with displayHierarchy', () => {
    const { statement } = queryCube(
      {
        name: 'Sales',
        dimensions: [PRODUCT_DIMENSION, SHARED_DIMENSION_TIME],
        cubes: [CUBE_SALESORDER]
      },
      {
        rows: [
          {
            dimension: '[Time]',
            level: '[Time].[Year]',
            displayHierarchy: true
          },
          {
            dimension: '[Product]',
            level: '[Product].[Brand Name]',
            displayHierarchy: true
          }
        ],
        columns: []
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )

    expect(statement).toEqual(
      "SELECT '(All)' AS `[Time]`, 'All' AS `[Time].[MEMBER_CAPTION]`, '' AS `[Time].[PARENT_UNIQUE_NAME]`, COUNT(DISTINCT concat('[', CASE WHEN `[time]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time]_time_by_day`.`the_year` AS VARCHAR) END,']')) AS `[Time].[CHILDREN_CARDINALITY]`, '(All)' AS `[Product]`, 'All' AS `[Product].[MEMBER_CAPTION]`, '' AS `[Product].[PARENT_UNIQUE_NAME]`, COUNT(DISTINCT concat('[', CASE WHEN `[product]_product`.`brand_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`brand_name` AS VARCHAR) END,']')) AS `[Product].[CHILDREN_CARDINALITY]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time]_time_by_day`.`time_id` INNER JOIN `product` AS `[product]_product` ON `salesorder_sales_fact`.`product_id` = `[product]_product`.`product_id` GROUP BY 1 union SELECT concat('[', CASE WHEN `[time]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time]_time_by_day`.`the_year` AS VARCHAR) END,']') AS `[Time]`, CAST(`[time]_time_by_day`.`the_year` AS VARCHAR) AS `[Time].[MEMBER_CAPTION]`, '(All)' AS `[Time].[PARENT_UNIQUE_NAME]`, COUNT(DISTINCT concat('[', CASE WHEN `[time]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time]_time_by_day`.`the_year` AS VARCHAR) END,'].[',CASE WHEN `[time]_time_by_day`.`quarter` IS NULL THEN '#' ELSE CAST(`[time]_time_by_day`.`quarter` AS VARCHAR) END,']')) AS `[Time].[CHILDREN_CARDINALITY]`, '(All)' AS `[Product]`, 'All' AS `[Product].[MEMBER_CAPTION]`, '' AS `[Product].[PARENT_UNIQUE_NAME]`, COUNT(DISTINCT concat('[', CASE WHEN `[product]_product`.`brand_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`brand_name` AS VARCHAR) END,']')) AS `[Product].[CHILDREN_CARDINALITY]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time]_time_by_day`.`time_id` INNER JOIN `product` AS `[product]_product` ON `salesorder_sales_fact`.`product_id` = `[product]_product`.`product_id` GROUP BY `[time]_time_by_day`.`the_year` union SELECT '(All)' AS `[Time]`, 'All' AS `[Time].[MEMBER_CAPTION]`, '' AS `[Time].[PARENT_UNIQUE_NAME]`, COUNT(DISTINCT concat('[', CASE WHEN `[time]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time]_time_by_day`.`the_year` AS VARCHAR) END,']')) AS `[Time].[CHILDREN_CARDINALITY]`, concat('[', CASE WHEN `[product]_product`.`brand_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`brand_name` AS VARCHAR) END,']') AS `[Product]`, CAST(`[product]_product`.`brand_name` AS VARCHAR) AS `[Product].[MEMBER_CAPTION]`, '(All)' AS `[Product].[PARENT_UNIQUE_NAME]`, COUNT(DISTINCT concat('[', CASE WHEN `[product]_product`.`brand_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`brand_name` AS VARCHAR) END,'].[',CASE WHEN `[product]_product`.`product_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`product_name` AS VARCHAR) END,']')) AS `[Product].[CHILDREN_CARDINALITY]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time]_time_by_day`.`time_id` INNER JOIN `product` AS `[product]_product` ON `salesorder_sales_fact`.`product_id` = `[product]_product`.`product_id` GROUP BY `[product]_product`.`brand_name` union SELECT concat('[', CASE WHEN `[time]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time]_time_by_day`.`the_year` AS VARCHAR) END,']') AS `[Time]`, CAST(`[time]_time_by_day`.`the_year` AS VARCHAR) AS `[Time].[MEMBER_CAPTION]`, '(All)' AS `[Time].[PARENT_UNIQUE_NAME]`, COUNT(DISTINCT concat('[', CASE WHEN `[time]_time_by_day`.`the_year` IS NULL THEN '#' ELSE CAST(`[time]_time_by_day`.`the_year` AS VARCHAR) END,'].[',CASE WHEN `[time]_time_by_day`.`quarter` IS NULL THEN '#' ELSE CAST(`[time]_time_by_day`.`quarter` AS VARCHAR) END,']')) AS `[Time].[CHILDREN_CARDINALITY]`, concat('[', CASE WHEN `[product]_product`.`brand_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`brand_name` AS VARCHAR) END,']') AS `[Product]`, CAST(`[product]_product`.`brand_name` AS VARCHAR) AS `[Product].[MEMBER_CAPTION]`, '(All)' AS `[Product].[PARENT_UNIQUE_NAME]`, COUNT(DISTINCT concat('[', CASE WHEN `[product]_product`.`brand_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`brand_name` AS VARCHAR) END,'].[',CASE WHEN `[product]_product`.`product_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`product_name` AS VARCHAR) END,']')) AS `[Product].[CHILDREN_CARDINALITY]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `time_by_day` AS `[time]_time_by_day` ON `salesorder_sales_fact`.`time_id` = `[time]_time_by_day`.`time_id` INNER JOIN `product` AS `[product]_product` ON `salesorder_sales_fact`.`product_id` = `[product]_product`.`product_id` GROUP BY `[time]_time_by_day`.`the_year`, `[product]_product`.`brand_name`"
    )
  })
})
