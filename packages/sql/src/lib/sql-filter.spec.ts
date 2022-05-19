import { AggregationRole, FilteringLogic, IAdvancedFilter } from '@metad/ocap-core'
import { convertFiltersToSQL } from './sql-filter'

describe('convertFiltersToSQL', () => {
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
        }
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
        }
      )
    ).toEqual(`( "Sales"."Product" IN ('A1', 'A2') ) AND ( "Sales"."Country" IN ('China') )`)
  })
})
