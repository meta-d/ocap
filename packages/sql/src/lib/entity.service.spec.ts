import { C_MEASURES, MockAgent } from '@metad/ocap-core'
import { PRODUCT_DIMENSION } from './dimension.spec'
import { SQLDataSource } from './data-source'
import { C_MEASURES_ROW_COUNT } from './types'
import { CUBE_SALESORDER, SHARED_DIMENSION_TIME } from './cube.spec'

describe('SQL Entity Service', () => {
  let dataSource: SQLDataSource

  beforeAll(() => {
    dataSource = new SQLDataSource(
      {
        name: 'Sales',
        type: 'SQL',
        schema: {
          name: 'Sales',
          dimensions: [
            PRODUCT_DIMENSION,
            SHARED_DIMENSION_TIME
          ],
          cubes: [
            CUBE_SALESORDER
          ]
        }
      },
      new MockAgent(),
      null
    )
  })

  it('Query Dimension', (done) => {
    const entityService = dataSource.createEntityService('Product')
    entityService.selectEntityType().subscribe((entityType) => {
      console.log(entityType)
      entityService
        .query({
          rows: [
            {
              dimension: '[Product]',
              level: '[Product].[Product Type]'
            },
            {
              dimension: '[Product]',
              level: '[Product].[Product Class]'
            },
            {
              dimension: '[Product]',
              level: '[Product].[Product]'
            }
          ]
        })
        .subscribe((result: any) => {
          // console.log(result)
          expect(result.statement).toEqual(
            `SELECT \`product_type\`.\`product_type_id\` AS \`[Product].[Product Type]\`,` +
              ` \`product_class\`.\`product_class_id\` AS \`[Product].[Product Class]\`,` +
              ` concat('C_', product_class.product_class_id) AS \`[Product].[Product Class].[MEMBER_CAPTION]\`,` +
              ` \`product\`.\`product_name\` AS \`[Product].[Product]\`,` +
              ` \`product\`.\`product_name\` AS \`[Product].[Product].[MEMBER_CAPTION]\``+
              ` FROM \`product\` AS \`product\` Left JOIN \`product_class\` AS \`product_class\`` +
              ` ON \`product\`.\`product_class_id\` = \`product_class\`.\`product_class_id\`` +
              ` Left JOIN \`product_type\` AS \`product_type\` ON \`product_class\`.\`product_type_id\` = \`product_type\`.\`product_type_id\``
          )
          done()
        })
    })
  })

  it('Query Dimension with Row Count', (done) => {
    const entityService = dataSource.createEntityService('Product')
    entityService.selectEntityType().subscribe((entityType) => {
      console.log(entityType)
      entityService
        .query({
          rows: [
            {
              dimension: '[Product]',
              level: '[Product].[Product Type]'
            },
            {
              dimension: '[Product]',
              level: '[Product].[Product Class]'
            },
            {
              dimension: '[Product]',
              level: '[Product].[Product]'
            }
          ],
          columns: [
            {
              dimension: C_MEASURES,
              measure: C_MEASURES_ROW_COUNT
            }
          ]
        })
        .subscribe((result: any) => {
          // console.log(result)
          expect(result.statement).toEqual(
            `SELECT \`product_type\`.\`product_type_id\` AS \`[Product].[Product Type]\`,` +
              ` \`product_class\`.\`product_class_id\` AS \`[Product].[Product Class]\`,` +
              ` concat('C_', product_class.product_class_id) AS \`[Product].[Product Class].[MEMBER_CAPTION]\`,` +
              ` \`product\`.\`product_name\` AS \`[Product].[Product]\`,` +
              ` \`product\`.\`product_name\` AS \`[Product].[Product].[MEMBER_CAPTION]\`,`+
              ` SUM(1) AS \`Measures_Row_Count\``+
              ` FROM \`product\` AS \`product\` Left JOIN \`product_class\` AS \`product_class\`` +
              ` ON \`product\`.\`product_class_id\` = \`product_class\`.\`product_class_id\`` +
              ` Left JOIN \`product_type\` AS \`product_type\` ON \`product_class\`.\`product_type_id\` = \`product_type\`.\`product_type_id\`` +
              ` GROUP BY \`product_type\`.\`product_type_id\`, \`product_class\`.\`product_class_id\`, \`product\`.\`product_name\``
          )
          done()
        })
    })
  })

  it('Query Cube', (done) => {
    const entityService = dataSource.createEntityService(CUBE_SALESORDER.name)
    entityService.selectEntityType().subscribe((entityType) => {
      console.log(entityType)
      entityService
        .query({
          rows: [
            {
              dimension: '[Product]',
              level: '[Product].[Product Type]'
            },
            {
              dimension: '[Product]',
              level: '[Product].[Product Class]'
            },
            {
              dimension: '[Product]',
              level: '[Product].[Product]'
            }
          ]
        })
        .subscribe((result: any) => {
          expect(result.statement).toEqual(
            "SELECT `[Product]` AS `[Product]`, `[Product]` AS `[Product]`, `[Product]` AS `[Product]` FROM (SELECT * FROM `sales_order`) AS `SalesOrder` WHERE (`[Product]` IS NOT NULL OR `[Product]` IS NOT NULL OR `[Product]` IS NOT NULL)"
          )
          done()
        })
    })
  })

})

describe('PG SQL Entity Service', () => {
  let dataSource: SQLDataSource

  beforeAll(() => {
    dataSource = new SQLDataSource(
      {
        name: 'Sales',
        type: 'SQL',
        dialect: 'pg',
        schema: {
          name: 'Sales',
          dimensions: [PRODUCT_DIMENSION]
        }
      },
      new MockAgent(),
      null
    )
  })

  it('Query Dimension', (done) => {
    const entityService = dataSource.createEntityService('Product')
    entityService.selectEntityType().subscribe((entityType) => {
      console.log(entityType)
      entityService
        .query({
          rows: [
            {
              dimension: '[Product]',
              level: '[Product].[Product Type]'
            },
            {
              dimension: '[Product]',
              level: '[Product].[Product Class]'
            },
            {
              dimension: '[Product]',
              level: '[Product].[Product]'
            }
          ]
        })
        .subscribe((result: any) => {
          // console.log(result)
          expect(result.statement).toEqual(
            `SELECT "product_type"."product_type_id" AS "[Product].[Product Type]",` +
              ` "product_class"."product_class_id" AS "[Product].[Product Class]",` +
              ` concat('C_', product_class.product_class_id) AS "[Product].[Product Class].[MEMBER_CAPTION]",` +
              ` "product"."product_name" AS "[Product].[Product]",` +
              ` "product"."product_name" AS "[Product].[Product].[MEMBER_CAPTION]"`+
              ` FROM "product" AS "product" Left JOIN "product_class" AS "product_class"` +
              ` ON "product"."product_class_id" = "product_class"."product_class_id"` +
              ` Left JOIN "product_type" AS "product_type" ON "product_class"."product_type_id" = "product_type"."product_type_id"`
          )
          done()
        })
    })
  })

  it('Query Dimension with Row Count', (done) => {
    const entityService = dataSource.createEntityService('Product')
    entityService.selectEntityType().subscribe((entityType) => {
      console.log(entityType)
      entityService
        .query({
          rows: [
            {
              dimension: '[Product]',
              level: '[Product].[Product Type]'
            },
            {
              dimension: '[Product]',
              level: '[Product].[Product Class]'
            },
            {
              dimension: '[Product]',
              level: '[Product].[Product]'
            }
          ],
          columns: [
            {
              dimension: C_MEASURES,
              measure: C_MEASURES_ROW_COUNT
            }
          ]
        })
        .subscribe((result: any) => {
          // console.log(result)
          expect(result.statement).toEqual(
            `SELECT "product_type"."product_type_id" AS "[Product].[Product Type]",` +
              ` "product_class"."product_class_id" AS "[Product].[Product Class]",` +
              ` concat('C_', product_class.product_class_id) AS "[Product].[Product Class].[MEMBER_CAPTION]",` +
              ` "product"."product_name" AS "[Product].[Product]",`+
              ` "product"."product_name" AS "[Product].[Product].[MEMBER_CAPTION]",`+
              ` SUM(1) AS "Measures_Row_Count"` +
              ` FROM "product" AS "product" Left JOIN "product_class" AS "product_class"` +
              ` ON "product"."product_class_id" = "product_class"."product_class_id"` +
              ` Left JOIN "product_type" AS "product_type" ON "product_class"."product_type_id" = "product_type"."product_type_id"` +
              ` GROUP BY "product_type"."product_type_id", "product_class"."product_class_id", "product"."product_name"`
          )
          done()
        })
    })
  })
})
