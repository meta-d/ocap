import { AggregationRole, C_MEASURES, EntitySemantics } from '@metad/ocap-core'
import { buildCubeContext } from './cube'
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
      { name: 'sales', cubes: [
        CUBE_SALESORDER
      ], dimensions: [
        SHARED_DIMENSION_TIME
      ] },
      { rows: [{ dimension: '[Time]' }] },
      ENTITY_TYPE_SALESORDER,
      ''
    )

    expect(query).toEqual("SELECT `time_by_day`.`the_year` AS `[Time].[Year]` FROM `sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` GROUP BY `time_by_day`.`the_year`")
  })

  it('query Hierarchy from Schema', async () => {
    const query = queryCube(
      { name: 'sales', cubes: [CUBE_SALESORDER], dimensions: [] },
      {
        rows: [{ dimension: '[Time]', hierarchy: '[Time.Weekly]', level: '[Time.Weekly].[Year]' }],
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
      'SELECT `time_by_day`.`the_year` AS `[Time.Weekly].[Year]`, sum(`sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` GROUP BY `time_by_day`.`the_year`'
    )
  })

  it('query Multi Levels from same Hierarchy', async () => {
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

    expect(query).toEqual(
      "SELECT `time_by_day`.`the_year` AS `[Time.Weekly].[Year]`, concat('[', `time_by_day`.`the_year`,'].[',`time_by_day`.`week_of_year`,']') AS `[Time.Weekly].[Week]`, `time_by_day`.`week_of_year` AS `[Time.Weekly].[Week].[MEMBER_CAPTION]`, sum(`sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` GROUP BY `time_by_day`.`the_year`, `time_by_day`.`week_of_year`"
    )
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
      "SELECT concat('[', `time_by_day`.`the_year`,'].[',`time_by_day`.`week_of_year`,']') AS `[Time.Weekly].[Week]`, `time_by_day`.`week_of_year` AS `[Time.Weekly].[Week].[MEMBER_CAPTION]`, sum(`sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` GROUP BY `time_by_day`.`the_year`, `time_by_day`.`week_of_year`"
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
})

describe('Build Cube', () => {
  it('Build Cube Context', () => {
    const cubeContext = buildCubeContext(
      { name: 'Sales', cubes: [CUBE_SALESORDER] },
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
        alias: '[Time.Weekly].[Year]',
        column: 'the_year',
        table: 'time_by_day'
      }
    ])
  })

  it('serializeCubeFrom', () => {
    const cubeContext = buildCubeContext(
      null,
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
      "SELECT concat('[', `time_by_day`.`the_year`,'].[',`time_by_day`.`week_of_year`,']') AS `[Time.Weekly].[Week]`, `time_by_day`.`week_of_year` AS `[Time.Weekly].[Week].[MEMBER_CAPTION]` FROM `sales_fact` AS `sales_fact` INNER JOIN `time_by_day` AS `time_by_day` ON `sales_fact`.`time_id` = `time_by_day`.`time_id` GROUP BY `time_by_day`.`the_year`, `time_by_day`.`week_of_year`"
    )
  })
})
