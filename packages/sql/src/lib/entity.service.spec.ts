import { C_MEASURES, MockAgent } from '@metad/ocap-core'
import { SQLDataSource } from './data-source'
import { CUBE_SALESORDER, PRODUCT_DIMENSION, SHARED_DIMENSION_TIME } from './mock-data'
import { C_MEASURES_ROW_COUNT } from './types'

describe('SQL Entity Service', () => {
  let dataSource: SQLDataSource

  beforeAll(() => {
    dataSource = new SQLDataSource(
      {
        name: 'Sales',
        type: 'SQL',
        schema: {
          name: 'Sales',
          dimensions: [PRODUCT_DIMENSION, SHARED_DIMENSION_TIME],
          cubes: [CUBE_SALESORDER]
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
          expect(result.statement).toEqual(
            "SELECT concat('[', CASE WHEN `[product]_product_type`.`product_type_id` IS NULL THEN '#' ELSE CAST(`[product]_product_type`.`product_type_id` AS VARCHAR) END,']') AS `[Product].[Product Type]`, CAST(`[product]_product_type`.`product_type_id` AS VARCHAR) AS `[Product].[Product Type].[MEMBER_CAPTION]`, concat('[', CASE WHEN `[product]_product_type`.`product_type_id` IS NULL THEN '#' ELSE CAST(`[product]_product_type`.`product_type_id` AS VARCHAR) END,'].[',CASE WHEN `[product]_product_class`.`product_class_id` IS NULL THEN '#' ELSE CAST(`[product]_product_class`.`product_class_id` AS VARCHAR) END,']') AS `[Product].[Product Class]`, concat('C_', product_class.product_class_id) AS `[Product].[Product Class].[MEMBER_CAPTION]`, concat('[', CASE WHEN `[product]_product_type`.`product_type_id` IS NULL THEN '#' ELSE CAST(`[product]_product_type`.`product_type_id` AS VARCHAR) END,'].[',CASE WHEN `[product]_product_class`.`product_class_id` IS NULL THEN '#' ELSE CAST(`[product]_product_class`.`product_class_id` AS VARCHAR) END,'].[',CASE WHEN `[product]_product`.`product_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`product_name` AS VARCHAR) END,']') AS `[Product].[Product]`, CAST(`[product]_product`.`product_name` AS VARCHAR) AS `[Product].[Product].[MEMBER_CAPTION]` FROM (`product` AS `[product]_product` Left JOIN `product_class` AS `[product]_product_class` ON `[product]_product`.`product_class_id` = `[product]_product_class`.`product_class_id` Left JOIN `product_type` AS `[product]_product_type` ON `[product]_product_class`.`product_type_id` = `[product]_product_type`.`product_type_id`)"
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
          expect(result.statement).toEqual(
            "SELECT concat('[', CASE WHEN `[product]_product_type`.`product_type_id` IS NULL THEN '#' ELSE CAST(`[product]_product_type`.`product_type_id` AS VARCHAR) END,']') AS `[Product].[Product Type]`, CAST(`[product]_product_type`.`product_type_id` AS VARCHAR) AS `[Product].[Product Type].[MEMBER_CAPTION]`, concat('[', CASE WHEN `[product]_product_type`.`product_type_id` IS NULL THEN '#' ELSE CAST(`[product]_product_type`.`product_type_id` AS VARCHAR) END,'].[',CASE WHEN `[product]_product_class`.`product_class_id` IS NULL THEN '#' ELSE CAST(`[product]_product_class`.`product_class_id` AS VARCHAR) END,']') AS `[Product].[Product Class]`, concat('C_', product_class.product_class_id) AS `[Product].[Product Class].[MEMBER_CAPTION]`, concat('[', CASE WHEN `[product]_product_type`.`product_type_id` IS NULL THEN '#' ELSE CAST(`[product]_product_type`.`product_type_id` AS VARCHAR) END,'].[',CASE WHEN `[product]_product_class`.`product_class_id` IS NULL THEN '#' ELSE CAST(`[product]_product_class`.`product_class_id` AS VARCHAR) END,'].[',CASE WHEN `[product]_product`.`product_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`product_name` AS VARCHAR) END,']') AS `[Product].[Product]`, CAST(`[product]_product`.`product_name` AS VARCHAR) AS `[Product].[Product].[MEMBER_CAPTION]`, SUM(1) AS `Measures_Row_Count` FROM (`product` AS `[product]_product` Left JOIN `product_class` AS `[product]_product_class` ON `[product]_product`.`product_class_id` = `[product]_product_class`.`product_class_id` Left JOIN `product_type` AS `[product]_product_type` ON `[product]_product_class`.`product_type_id` = `[product]_product_type`.`product_type_id`) GROUP BY `[product]_product_type`.`product_type_id`, `[product]_product_class`.`product_class_id`, `[product]_product`.`product_name`"
          )
          done()
        })
    })
  })

  it('Query Cube', (done) => {
    const entityService = dataSource.createEntityService(CUBE_SALESORDER.name)
    entityService.selectEntityType().subscribe(() => {
      entityService
        .query({
          rows: [
            {
              dimension: '[Product]',
              level: '[Product].[Product]'
            }
          ]
        })
        .subscribe((result: any) => {
          expect(result.statement).toEqual(
            "SELECT concat('[', CASE WHEN `[product]_product`.`brand_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`brand_name` AS VARCHAR) END,'].[',CASE WHEN `[product]_product`.`product_name` IS NULL THEN '#' ELSE CAST(`[product]_product`.`product_name` AS VARCHAR) END,']') AS `[Product]`, CAST(`[product]_product`.`product_name` AS VARCHAR) AS `[Product].[MEMBER_CAPTION]`, sum(`salesorder_sales_fact`.`store_sales`) AS `Sales` FROM `sales_fact` AS `salesorder_sales_fact` INNER JOIN `product` AS `[product]_product` ON `salesorder_sales_fact`.`product_id` = `[product]_product`.`product_id` GROUP BY `[product]_product`.`brand_name`, `[product]_product`.`product_name`"
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
          dimensions: [PRODUCT_DIMENSION, SHARED_DIMENSION_TIME],
          cubes: [CUBE_SALESORDER]
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
            `SELECT concat('[', CASE WHEN "[product]_product_type"."product_type_id" IS NULL THEN '#' ELSE CAST("[product]_product_type"."product_type_id" AS VARCHAR) END,']') AS "[Product].[Product Type]", CAST("[product]_product_type"."product_type_id" AS VARCHAR) AS "[Product].[Product Type].[MEMBER_CAPTION]", concat('[', CASE WHEN "[product]_product_type"."product_type_id" IS NULL THEN '#' ELSE CAST("[product]_product_type"."product_type_id" AS VARCHAR) END,'].[',CASE WHEN "[product]_product_class"."product_class_id" IS NULL THEN '#' ELSE CAST("[product]_product_class"."product_class_id" AS VARCHAR) END,']') AS "[Product].[Product Class]", concat('C_', product_class.product_class_id) AS "[Product].[Product Class].[MEMBER_CAPTION]", concat('[', CASE WHEN "[product]_product_type"."product_type_id" IS NULL THEN '#' ELSE CAST("[product]_product_type"."product_type_id" AS VARCHAR) END,'].[',CASE WHEN "[product]_product_class"."product_class_id" IS NULL THEN '#' ELSE CAST("[product]_product_class"."product_class_id" AS VARCHAR) END,'].[',CASE WHEN "[product]_product"."product_name" IS NULL THEN '#' ELSE CAST("[product]_product"."product_name" AS VARCHAR) END,']') AS "[Product].[Product]", CAST("[product]_product"."product_name" AS VARCHAR) AS "[Product].[Product].[MEMBER_CAPTION]" FROM ("product" AS "[product]_product" Left JOIN "product_class" AS "[product]_product_class" ON "[product]_product"."product_class_id" = "[product]_product_class"."product_class_id" Left JOIN "product_type" AS "[product]_product_type" ON "[product]_product_class"."product_type_id" = "[product]_product_type"."product_type_id")`
          )
          done()
        })
    })
  })

  it('Query Sales Cube with default All level', (done) => {
    const entityService = dataSource.createEntityService('SalesOrder')
    entityService.selectEntityType().subscribe(() => {
      entityService
        .query({
          rows: [
            {
              dimension: '[Product]'
            }
          ]
        })
        .subscribe((result: any) => {
          expect(result.statement).toEqual(
            `SELECT '(All)' AS "[Product]", 'All' AS "[Product].[MEMBER_CAPTION]", sum("salesorder_sales_fact"."store_sales") AS "Sales" FROM "sales_fact" AS "salesorder_sales_fact" INNER JOIN "product" AS "[product]_product" ON "salesorder_sales_fact"."product_id" = "[product]_product"."product_id" GROUP BY 1`
          )
          done()
        })
    })
  })

  it('Query Dimension with Row Count', (done) => {
    const entityService = dataSource.createEntityService('Product')
    entityService.selectEntityType().subscribe(() => {
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
          expect(result.statement).toEqual(
            `SELECT concat('[', CASE WHEN "[product]_product_type"."product_type_id" IS NULL THEN '#' ELSE CAST("[product]_product_type"."product_type_id" AS VARCHAR) END,']') AS "[Product].[Product Type]", CAST("[product]_product_type"."product_type_id" AS VARCHAR) AS "[Product].[Product Type].[MEMBER_CAPTION]", concat('[', CASE WHEN "[product]_product_type"."product_type_id" IS NULL THEN '#' ELSE CAST("[product]_product_type"."product_type_id" AS VARCHAR) END,'].[',CASE WHEN "[product]_product_class"."product_class_id" IS NULL THEN '#' ELSE CAST("[product]_product_class"."product_class_id" AS VARCHAR) END,']') AS "[Product].[Product Class]", concat('C_', product_class.product_class_id) AS "[Product].[Product Class].[MEMBER_CAPTION]", concat('[', CASE WHEN "[product]_product_type"."product_type_id" IS NULL THEN '#' ELSE CAST("[product]_product_type"."product_type_id" AS VARCHAR) END,'].[',CASE WHEN "[product]_product_class"."product_class_id" IS NULL THEN '#' ELSE CAST("[product]_product_class"."product_class_id" AS VARCHAR) END,'].[',CASE WHEN "[product]_product"."product_name" IS NULL THEN '#' ELSE CAST("[product]_product"."product_name" AS VARCHAR) END,']') AS "[Product].[Product]", CAST("[product]_product"."product_name" AS VARCHAR) AS "[Product].[Product].[MEMBER_CAPTION]", SUM(1) AS "Measures_Row_Count" FROM ("product" AS "[product]_product" Left JOIN "product_class" AS "[product]_product_class" ON "[product]_product"."product_class_id" = "[product]_product_class"."product_class_id" Left JOIN "product_type" AS "[product]_product_type" ON "[product]_product_class"."product_type_id" = "[product]_product_type"."product_type_id") GROUP BY "[product]_product_type"."product_type_id", "[product]_product_class"."product_class_id", "[product]_product"."product_name"`
          )
          done()
        })
    })
  })
})
