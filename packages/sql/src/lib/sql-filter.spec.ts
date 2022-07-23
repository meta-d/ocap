import { AggregationRole, FilteringLogic, IAdvancedFilter } from '@metad/ocap-core'
import { CUBE_SALESORDER, ENTITY_TYPE_SALESORDER } from './mock-data'
import { convertFiltersToSQL, compileSlicer } from './sql-filter'


describe('convertFiltersToSQL', () => {

  it('#explainSlicer', () => {

    expect(compileSlicer(
      {
        dimension: {
          dimension: '[Product]'
        },
        members: [
          {
            value: '[A]'
          },
          {
            value: '[Brand (1)]'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      {
        schema: CUBE_SALESORDER,
        entityType: ENTITY_TYPE_SALESORDER,
        factTable: 'sales_fact',
        dimensions: [],
        measures: []
      },
      ''
    )).toEqual("(`[product]_product`.`brand_name` = 'A') OR (`[product]_product`.`brand_name` = 'Brand (1)')")

    expect(compileSlicer(
      {
        dimension: {
          dimension: '[Product]'
        },
        members: [
          {
            value: '[A].[B]'
          },
          {
            value: '[Brand (1)].[Product: 2]'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      {
        schema: CUBE_SALESORDER,
        entityType: ENTITY_TYPE_SALESORDER,
        factTable: 'sales_fact',
        dimensions: [],
        measures: []
      },
      ''
    )).toEqual("(`[product]_product`.`brand_name` = 'A' AND `[product]_product`.`product_name` = 'B') OR (`[product]_product`.`brand_name` = 'Brand (1)' AND `[product]_product`.`product_name` = 'Product: 2')")

    expect(compileSlicer(
      {
        dimension: {
          dimension: '[Product]'
        },
        members: [
          {
            value: '[A]'
          },
          {
            value: '[Brand (1)].[Product: 2]'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      {
        schema: CUBE_SALESORDER,
        entityType: ENTITY_TYPE_SALESORDER,
        factTable: 'sales_fact',
        dimensions: [],
        measures: []
      },
      ''
    )).toEqual("(`[product]_product`.`brand_name` = 'A') OR (`[product]_product`.`brand_name` = 'Brand (1)' AND `[product]_product`.`product_name` = 'Product: 2')")
  })

  it('#explainSlicer exclude members', () => {

    expect(compileSlicer(
      {
        dimension: {
          dimension: '[Product]'
        },
        exclude: true,
        members: [
          {
            value: '[A]'
          },
          {
            value: '[Brand (1)]'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      {
        schema: CUBE_SALESORDER,
        entityType: ENTITY_TYPE_SALESORDER,
        factTable: 'sales_fact',
        dimensions: [],
        measures: []
      },
      ''
    )).toEqual("NOT (`[product]_product`.`brand_name` = 'A') AND NOT (`[product]_product`.`brand_name` = 'Brand (1)')")

    expect(compileSlicer(
      {
        dimension: {
          dimension: '[Product]'
        },
        exclude: true,
        members: [
          {
            value: '[A].[B]'
          },
          {
            value: '[Brand (1)].[Product: 2]'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      {
        schema: CUBE_SALESORDER,
        entityType: ENTITY_TYPE_SALESORDER,
        factTable: 'sales_fact',
        dimensions: [],
        measures: []
      },
      ''
    )).toEqual("NOT (`[product]_product`.`brand_name` = 'A' AND `[product]_product`.`product_name` = 'B') AND NOT (`[product]_product`.`brand_name` = 'Brand (1)' AND `[product]_product`.`product_name` = 'Product: 2')")

    expect(compileSlicer(
      {
        dimension: {
          dimension: '[Product]'
        },
        exclude: true,
        members: [
          {
            value: '[A]'
          },
          {
            value: '[Brand (1)].[Product: 2]'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      {
        schema: CUBE_SALESORDER,
        entityType: ENTITY_TYPE_SALESORDER,
        factTable: 'sales_fact',
        dimensions: [],
        measures: []
      },
      ''
    )).toEqual("NOT (`[product]_product`.`brand_name` = 'A') AND NOT (`[product]_product`.`brand_name` = 'Brand (1)' AND `[product]_product`.`product_name` = 'Product: 2')")
  })

  it('#explainSlicer with Degenerate dimension', () => {

    expect(compileSlicer(
      {
        dimension: {
          dimension: '[Payment method]',
        },
        members: [
          {
            value: '[Credit]'
          },
          {
            value: '[ATM]'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      {
        schema: CUBE_SALESORDER,
        entityType: ENTITY_TYPE_SALESORDER,
        factTable: 'sales_fact',
        dimensions: [],
        measures: []
      },
      ''
    )).toEqual("(`sales_fact`.`payment_method` = 'Credit') OR (`sales_fact`.`payment_method` = 'ATM')")
  })

  it('#convertFiltersToSQL', () => {
    expect(
      convertFiltersToSQL(
        [
          {
            dimension: {
              dimension: 'Product'
            },
            members: [
              {
                value: 'A1'
              }
            ]
          }
        ],
        {
          name: 'Sales',
          properties: {
            Product: {
              name: 'Product',
              role: AggregationRole.dimension
            }
          }
        },
        'pg'
      )
    ).toEqual(`"Sales"."Product" IN ('A1')`)
  })

  it('#advanced filters', () => {
    expect(
      convertFiltersToSQL(
        [
          {
            children: [
              {
                dimension: {
                  dimension: 'Product'
                },
                members: [
                  {
                    value: 'A1'
                  },
                  {
                    value: 'A2'
                  }
                ]
              },
              {
                dimension: {
                  dimension: 'Country'
                },
                members: [
                  {
                    value: 'China'
                  }
                ]
              }
            ],
            filteringLogic: FilteringLogic.And
          } as IAdvancedFilter
        ],
        {
          name: 'Sales',
          properties: {
            Product: {
              name: 'Product',
              role: AggregationRole.dimension
            },
            Country: {
              name: 'Country',
              role: AggregationRole.dimension
            }
          }
        },
        'pg'
      )
    ).toEqual(`( "Sales"."Product" IN ('A1', 'A2') ) AND ( "Sales"."Country" IN ('China') )`)
  })
})
