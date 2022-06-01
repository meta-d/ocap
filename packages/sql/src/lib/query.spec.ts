import { AggregationRole, C_MEASURES, EntitySemantics } from '@metad/ocap-core'
import { queryCube, serializeSelectFields } from './query'

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

  it('query Basic', async () => {
    const query = queryCube(
      { name: 'sales', cubes: [], dimensions: [] },
      { rows: [] },
      { name: 'sales', properties: {} },
      ''
    )

    expect(query).toEqual(`SELECT * FROM "sales"`)
  })

  it('query Only Dimension', async () => {
    const query = queryCube(
      { name: 'sales', cubes: [], dimensions: [] },
      { rows: [{ dimension: 'Customer' }] },
      SalesEntityType,
      ''
    )

    expect(query).toEqual(
      `SELECT "Customer" AS "Customer" FROM "sales" WHERE ("Customer" IS NOT NULL) GROUP BY "Customer"`
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
    expect(context.groupbys).toEqual([`"Customer"`])
    expect(context.select).toEqual(['"Customer" AS "Customer"'])
    expect(context.unbookedData).toEqual(['"Customer" IS NOT NULL'])

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

    expect(context.groupbys).toEqual([`"Customer"`])
    expect(context.select).toEqual(['SUM("sales") AS "sales"', '"Customer" AS "Customer"'])
  })
})
