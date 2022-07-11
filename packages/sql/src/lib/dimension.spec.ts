import { AggregationRole, C_MEASURES, serializeUniqueName } from '@metad/ocap-core'
import { compileDimensionSchema, DimensionMembers, queryDimension } from './dimension'
import { CUBE_SALESORDER, EMPLOYEE_DIMENSION, ENTITY_TYPE_SALESORDER, PRODUCT_DIMENSION } from './mock-data'
import { C_MEASURES_ROW_COUNT } from './types'

const ENTITY_TYPE = {
  name: 'SalesOrder',
  properties: {
    [serializeUniqueName(PRODUCT_DIMENSION.name)]: compileDimensionSchema(PRODUCT_DIMENSION.name, PRODUCT_DIMENSION),
    [serializeUniqueName(EMPLOYEE_DIMENSION.name)]: compileDimensionSchema(EMPLOYEE_DIMENSION.name, EMPLOYEE_DIMENSION),
    '[Payment method]': {
      name: '[Payment method]',
      role: AggregationRole.dimension,
      hierarchies: [
        {
          name: '[Payment method]',
          hasAll: true,
          levels: [
            {
              name: '[Payment method].[Payment method]',
              column: 'payment_method',
              uniqueMembers: true
            }
          ]
        }
      ]
    }
  }
}

describe('SQL Entity Service', () => {
  beforeAll(() => {
    //
  })

  it('Query Dimension', () => {
    expect(
      queryDimension(PRODUCT_DIMENSION, ENTITY_TYPE, {
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
    ).toEqual(
      "SELECT concat('[', `product_type`.`product_type_id`,']') AS `[Product].[Product Type]`, `product_type`.`product_type_id` AS `[Product].[Product Type].[MEMBER_CAPTION]`, concat('[', `product_type`.`product_type_id`,'].[',`product_class`.`product_class_id`,']') AS `[Product].[Product Class]`, concat('C_', product_class.product_class_id) AS `[Product].[Product Class].[MEMBER_CAPTION]`, concat('[', `product_type`.`product_type_id`,'].[',`product_class`.`product_class_id`,'].[',`product`.`product_name`,']') AS `[Product].[Product]`, `product`.`product_name` AS `[Product].[Product].[MEMBER_CAPTION]` FROM `product` AS `product` Left JOIN `product_class` AS `product_class` ON `product`.`product_class_id` = `product_class`.`product_class_id` Left JOIN `product_type` AS `product_type` ON `product_class`.`product_type_id` = `product_type`.`product_type_id`"
    )

    expect(
      queryDimension(PRODUCT_DIMENSION, ENTITY_TYPE, {
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
    ).toEqual(
      "SELECT concat('[', `product_type`.`product_type_id`,']') AS `[Product].[Product Type]`, `product_type`.`product_type_id` AS `[Product].[Product Type].[MEMBER_CAPTION]`, concat('[', `product_type`.`product_type_id`,'].[',`product_class`.`product_class_id`,']') AS `[Product].[Product Class]`, concat('C_', product_class.product_class_id) AS `[Product].[Product Class].[MEMBER_CAPTION]`, concat('[', `product_type`.`product_type_id`,'].[',`product_class`.`product_class_id`,'].[',`product`.`product_name`,']') AS `[Product].[Product]`, `product`.`product_name` AS `[Product].[Product].[MEMBER_CAPTION]`, SUM(1) AS `Measures_Row_Count` FROM `product` AS `product` Left JOIN `product_class` AS `product_class` ON `product`.`product_class_id` = `product_class`.`product_class_id` Left JOIN `product_type` AS `product_type` ON `product_class`.`product_type_id` = `product_type`.`product_type_id` GROUP BY `product_type`.`product_type_id`, `product_class`.`product_class_id`, `product`.`product_name`"
    )

    expect(
      queryDimension(PRODUCT_DIMENSION, ENTITY_TYPE, {
        rows: [
          {
            dimension: '[Product]',
            hierarchy: '[Product.Class]',
            level: '[Product.Class].[Class]'
          },
          {
            dimension: '[Product]',
            hierarchy: '[Product.Class]',
            level: '[Product.Class].[Product Id]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: C_MEASURES_ROW_COUNT
          }
        ]
      })
    ).toEqual(
      "SELECT concat('[', `product_class`.`product_class_id`,']') AS `[Product.Class].[Class]`, concat('C_', product_class.product_class_id) AS `[Product.Class].[Class].[MEMBER_CAPTION]`, concat('[', `product_class`.`product_class_id`,'].[',`product`.`product_id`,']') AS `[Product.Class].[Product Id]`, `product`.`product_name` AS `[Product.Class].[Product Id].[MEMBER_CAPTION]`, SUM(1) AS `Measures_Row_Count` FROM `product` AS `product` Left JOIN `product_class` AS `product_class` ON `product`.`product_class_id` = `product_class`.`product_class_id` GROUP BY `product_class`.`product_class_id`, `product`.`product_id`, `product`.`product_name`"
    )

    expect(
      queryDimension(
        PRODUCT_DIMENSION,
        ENTITY_TYPE,
        {
          rows: [
            {
              dimension: '[Product]',
              hierarchy: '[Product.Class]',
              level: '[Product.Class].[Class]'
            },
            {
              dimension: '[Product]',
              hierarchy: '[Product.Class]',
              level: '[Product.Class].[Product Id]'
            }
          ],
          columns: [
            {
              dimension: C_MEASURES,
              measure: C_MEASURES_ROW_COUNT
            }
          ]
        },
        'pg'
      )
    ).toEqual(
      `SELECT concat('[', "product_class"."product_class_id",']') AS "[Product.Class].[Class]", concat('C_', product_class.product_class_id) AS "[Product.Class].[Class].[MEMBER_CAPTION]", concat('[', "product_class"."product_class_id",'].[',"product"."product_id",']') AS "[Product.Class].[Product Id]", "product"."product_name" AS "[Product.Class].[Product Id].[MEMBER_CAPTION]", SUM(1) AS "Measures_Row_Count" FROM "product" AS "product" Left JOIN "product_class" AS "product_class" ON "product"."product_class_id" = "product_class"."product_class_id" GROUP BY "product_class"."product_class_id", "product"."product_id", "product"."product_name"`
    )
  })

  it('Query Dimension with Property', () => {
    expect(
      queryDimension(PRODUCT_DIMENSION, ENTITY_TYPE, {
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
            level: '[Product].[Product]',
            properties: ['[Product].[Shelf Width]']
          }
        ]
      })
    ).toEqual(
      "SELECT concat('[', `product_type`.`product_type_id`,']') AS `[Product].[Product Type]`, `product_type`.`product_type_id` AS `[Product].[Product Type].[MEMBER_CAPTION]`, concat('[', `product_type`.`product_type_id`,'].[',`product_class`.`product_class_id`,']') AS `[Product].[Product Class]`, concat('C_', product_class.product_class_id) AS `[Product].[Product Class].[MEMBER_CAPTION]`, concat('[', `product_type`.`product_type_id`,'].[',`product_class`.`product_class_id`,'].[',`product`.`product_name`,']') AS `[Product].[Product]`, `product`.`product_name` AS `[Product].[Product].[MEMBER_CAPTION]`, `product`.`shelf_width` AS `[Product].[Shelf Width]` FROM `product` AS `product` Left JOIN `product_class` AS `product_class` ON `product`.`product_class_id` = `product_class`.`product_class_id` Left JOIN `product_type` AS `product_type` ON `product_class`.`product_type_id` = `product_type`.`product_type_id`"
    )

    expect(
      queryDimension(PRODUCT_DIMENSION, ENTITY_TYPE, {
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
            level: '[Product].[Product]',
            properties: ['[Product].[Shelf Width]']
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: C_MEASURES_ROW_COUNT
          }
        ]
      })
    ).toEqual(
      "SELECT concat('[', `product_type`.`product_type_id`,']') AS `[Product].[Product Type]`, `product_type`.`product_type_id` AS `[Product].[Product Type].[MEMBER_CAPTION]`, concat('[', `product_type`.`product_type_id`,'].[',`product_class`.`product_class_id`,']') AS `[Product].[Product Class]`, concat('C_', product_class.product_class_id) AS `[Product].[Product Class].[MEMBER_CAPTION]`, concat('[', `product_type`.`product_type_id`,'].[',`product_class`.`product_class_id`,'].[',`product`.`product_name`,']') AS `[Product].[Product]`, `product`.`product_name` AS `[Product].[Product].[MEMBER_CAPTION]`, `product`.`shelf_width` AS `[Product].[Shelf Width]`, SUM(1) AS `Measures_Row_Count` FROM `product` AS `product` Left JOIN `product_class` AS `product_class` ON `product`.`product_class_id` = `product_class`.`product_class_id` Left JOIN `product_type` AS `product_type` ON `product_class`.`product_type_id` = `product_type`.`product_type_id` GROUP BY `product_type`.`product_type_id`, `product_class`.`product_class_id`, `product`.`product_name`, `product`.`shelf_width`"
    )
  })
})

describe('Parent-child hierarchies', () => {
  it('Query Dimension', () => {
    expect(
      queryDimension(EMPLOYEE_DIMENSION, ENTITY_TYPE, {
        rows: [
          {
            dimension: '[Employee]',
            level: '[Employee].[Name]',
            properties: ['[Employee].[Name].[PARENT_UNIQUE_NAME]']
          }
        ]
      })
    ).toEqual(
      "SELECT concat('[', `employee`.`full_name`,']') AS `[Employee].[Name]`, `employee`.`full_name` AS `[Employee].[Name].[MEMBER_CAPTION]`, `employee(1)`.`full_name` AS `[Employee].[Name].[PARENT_UNIQUE_NAME]` FROM `employee` AS `employee` Left JOIN `employee` AS `employee(1)` ON `employee`.`supervisor_id` = `employee(1)`.`employee_id`"
    )
  })

  it('Query Dimension with Count Measure', () => {
    expect(
      queryDimension(EMPLOYEE_DIMENSION, ENTITY_TYPE, {
        rows: [
          {
            dimension: '[Employee]',
            level: '[Employee].[Name]',
            properties: ['[Employee].[Name].[PARENT_UNIQUE_NAME]']
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            measure: C_MEASURES_ROW_COUNT
          }
        ]
      })
    ).toEqual(
      "SELECT concat('[', `employee`.`full_name`,']') AS `[Employee].[Name]`, `employee`.`full_name` AS `[Employee].[Name].[MEMBER_CAPTION]`, `employee(1)`.`full_name` AS `[Employee].[Name].[PARENT_UNIQUE_NAME]`, SUM(1) AS `Measures_Row_Count` FROM `employee` AS `employee` Left JOIN `employee` AS `employee(1)` ON `employee`.`supervisor_id` = `employee(1)`.`employee_id` GROUP BY `employee`.`full_name`, `employee(1)`.`full_name`"
    )
  })

  it('Query Dimension with Count Measure pg', () => {
    expect(
      queryDimension(
        EMPLOYEE_DIMENSION,
        ENTITY_TYPE,
        {
          rows: [
            {
              dimension: '[Employee]',
              level: '[Employee].[Name]',
              properties: ['[Employee].[Name].[PARENT_UNIQUE_NAME]']
            }
          ],
          columns: [
            {
              dimension: C_MEASURES,
              measure: C_MEASURES_ROW_COUNT
            }
          ]
        },
        'pg'
      )
    ).toEqual(
      `SELECT concat('[', "employee"."full_name",']') AS "[Employee].[Name]", "employee"."full_name" AS "[Employee].[Name].[MEMBER_CAPTION]", "employee(1)"."full_name" AS "[Employee].[Name].[PARENT_UNIQUE_NAME]", SUM(1) AS "Measures_Row_Count" FROM "employee" AS "employee" Left JOIN "employee" AS "employee(1)" ON "employee"."supervisor_id" = "employee(1)"."employee_id" GROUP BY "employee"."full_name", "employee(1)"."full_name"`
    )
  })
})

describe('Convert Dimension Schema to Runtime', () => {
  beforeAll(() => {
    //
  })

  it('Runtime Dimension', () => {
    expect(compileDimensionSchema(PRODUCT_DIMENSION.name, PRODUCT_DIMENSION)).toEqual({
      entity: 'Product',
      name: '[Product]',
      role: 'dimension',
      hierarchies: [
        {
          entity: 'Product',
          dimension: '[Product]',
          name: '[Product]',
          primaryKey: 'product_id',
          caption: '[Product].[MEMBER_CAPTION]',
          role: AggregationRole.hierarchy,
          tables: [
            { name: 'product' },
            {
              join: { fields: [{ leftKey: 'product_class_id', rightKey: 'product_class_id' }], type: 'Left' },
              name: 'product_class'
            },
            {
              join: { fields: [{ leftKey: 'product_type_id', rightKey: 'product_type_id' }], type: 'Left' },
              name: 'product_type'
            }
          ],
          levels: [
            {
              column: 'product_type_id',
              entity: 'Product',
              dimension: '[Product]',
              hierarchy: '[Product]',
              name: '[Product].[Product Type]',
              caption: '[Product].[Product Type].[MEMBER_CAPTION]',
              properties: undefined,
              table: 'product_type',
              role: AggregationRole.level,
              uniqueMembers: true,
              levelNumber: 0
            },
            {
              column: 'product_class_id',
              entity: 'Product',
              dimension: '[Product]',
              hierarchy: '[Product]',
              name: '[Product].[Product Class]',
              caption: '[Product].[Product Class].[MEMBER_CAPTION]',
              properties: [{ column: 'product_category', label: 'Category', name: '[Product].[Category]' }],
              table: 'product_class',
              role: AggregationRole.level,
              uniqueMembers: null,
              levelNumber: 1,
              captionExpression: {
                sql: {
                  content: "concat('C_', product_class.product_class_id)",
                  dialect: 'generic'
                }
              }
            },
            {
              column: 'product_id',
              entity: 'Product',
              dimension: '[Product]',
              hierarchy: '[Product]',
              name: '[Product].[Product]',
              caption: '[Product].[Product].[MEMBER_CAPTION]',
              nameColumn: 'product_name',
              role: AggregationRole.level,
              uniqueMembers: true,
              levelNumber: 2,
              properties: [
                { column: 'shelf_width', label: 'Shelf Width', name: '[Product].[Shelf Width]' },
                { column: 'units_per_case', label: 'Units PerCase', name: '[Product].[Units PerCase]' }
              ],
              table: 'product'
            }
          ]
        },
        {
          entity: 'Product',
          dimension: '[Product]',
          name: '[Product.Class]',
          caption: '[Product.Class].[MEMBER_CAPTION]',
          hasAll: true,
          tables: [
            { name: 'product' },
            {
              join: { fields: [{ leftKey: 'product_class_id', rightKey: 'product_class_id' }], type: 'Left' },
              name: 'product_class'
            }
          ],
          role: AggregationRole.hierarchy,
          levels: [
            {
              caption: '[Product.Class].[(All Classs)].[MEMBER_CAPTION]',
              entity: 'Product',
              dimension: '[Product]',
              hierarchy: '[Product.Class]',
              levelNumber: 0,
              name: '[Product.Class].[(All Classs)]',
              properties: [],
              role: 'level'
            },
            {
              column: 'product_class_id',
              entity: 'Product',
              dimension: '[Product]',
              hierarchy: '[Product.Class]',
              name: '[Product.Class].[Class]',
              caption: '[Product.Class].[Class].[MEMBER_CAPTION]',
              properties: [{ column: 'product_category', label: 'Category', name: '[Product.Class].[Category]' }],
              table: 'product_class',
              role: AggregationRole.level,
              levelNumber: 1,
              captionExpression: {
                sql: {
                  content: "concat('C_', product_class.product_class_id)",
                  dialect: 'generic'
                }
              }
            },
            {
              column: 'product_id',
              entity: 'Product',
              dimension: '[Product]',
              hierarchy: '[Product.Class]',
              name: '[Product.Class].[Product Id]',
              caption: '[Product.Class].[Product Id].[MEMBER_CAPTION]',
              role: AggregationRole.level,
              levelNumber: 2,
              properties: [
                { column: 'shelf_width', label: 'Shelf Width', name: '[Product.Class].[Shelf Width]' },
                { column: 'units_per_case', label: 'Units PerCase', name: '[Product.Class].[Units PerCase]' }
              ],
              table: 'product',
              captionColumn: 'product_name'
            }
          ]
        }
      ]
    })

    expect(compileDimensionSchema(EMPLOYEE_DIMENSION.name, EMPLOYEE_DIMENSION)).toEqual({
      entity: 'Employee',
      name: '[Employee]',
      hierarchies: [
        {
          name: '[Employee]',
          entity: 'Employee',
          dimension: '[Employee]',
          caption: '[Employee].[MEMBER_CAPTION]',
          tables: [{ name: 'employee' }],
          role: AggregationRole.hierarchy,
          levels: [
            {
              entity: 'Employee',
              dimension: '[Employee]',
              hierarchy: '[Employee]',
              name: '[Employee].[Name]',
              caption: '[Employee].[Name].[MEMBER_CAPTION]',
              column: 'employee_id',
              nameColumn: 'full_name',
              parentColumn: 'supervisor_id',
              properties: undefined,
              role: AggregationRole.level,
              uniqueMembers: true,
              levelNumber: 0
            }
          ]
        }
      ],
      role: AggregationRole.dimension
    })
  })
})

describe('Get Dimension Members', () => {
  it('Dimension Members', () => {
    const statement = DimensionMembers(
      'Product',
      { dimension: '[Product]' },
      ENTITY_TYPE,
      { name: 'Sales', dimensions: [PRODUCT_DIMENSION] },
      'pg'
    )
    expect(statement).toEqual([
      'SELECT concat(\'[\', "product_type"."product_type_id",\']\') AS "memberKey", "product"."product_type_id" AS "memberCaption" FROM "product" AS "product" Left JOIN "product_class" AS "product_class" ON "product"."product_class_id" = "product_class"."product_class_id" Left JOIN "product_type" AS "product_type" ON "product_class"."product_type_id" = "product_type"."product_type_id" GROUP BY "product_type"."product_type_id", "product"."product_type_id"',
      'SELECT concat(\'[\', "product_type"."product_type_id",\'].[\',"product_class"."product_class_id",\']\') AS "memberKey", concat(\'C_\', product_class.product_class_id) AS "memberCaption", concat(\'[\', "product_type"."product_type_id",\']\') AS "parentKey" FROM "product" AS "product" Left JOIN "product_class" AS "product_class" ON "product"."product_class_id" = "product_class"."product_class_id" Left JOIN "product_type" AS "product_type" ON "product_class"."product_type_id" = "product_type"."product_type_id" GROUP BY "product_type"."product_type_id", "product_class"."product_class_id", "product"."product_class_id"',
      'SELECT concat(\'[\', "product_type"."product_type_id",\'].[\',"product_class"."product_class_id",\'].[\',"product"."product_name",\']\') AS "memberKey", "product"."product_name" AS "memberCaption", concat(\'[\', "product_type"."product_type_id",\'].[\',"product_class"."product_class_id",\']\') AS "parentKey" FROM "product" AS "product" Left JOIN "product_class" AS "product_class" ON "product"."product_class_id" = "product_class"."product_class_id" Left JOIN "product_type" AS "product_type" ON "product_class"."product_type_id" = "product_type"."product_type_id" GROUP BY "product_type"."product_type_id", "product_class"."product_class_id", "product"."product_name"'
    ])
  })

  it('Dimension Members', () => {
    const statement = DimensionMembers(
      'Product',
      { dimension: '[Product]', hierarchy: '[Product.Class]' },
      ENTITY_TYPE,
      { name: 'Sales', dimensions: [PRODUCT_DIMENSION] },
      'pg'
    )
    expect(statement).toEqual([
      'SELECT \'[(All)]\' AS "memberKey", \'All\' AS "memberCaption" FROM "product" AS "product" Left JOIN "product_class" AS "product_class" ON "product"."product_class_id" = "product_class"."product_class_id" GROUP BY 1',
      'SELECT concat(\'[\', "product_class"."product_class_id",\']\') AS "memberKey", concat(\'C_\', product_class.product_class_id) AS "memberCaption", \'[(All)]\' AS "parentKey" FROM "product" AS "product" Left JOIN "product_class" AS "product_class" ON "product"."product_class_id" = "product_class"."product_class_id" GROUP BY "product_class"."product_class_id", "product"."product_class_id"',
      'SELECT concat(\'[\', "product_class"."product_class_id",\'].[\',"product"."product_id",\']\') AS "memberKey", "product"."product_name" AS "memberCaption", concat(\'[\', "product_class"."product_class_id",\']\') AS "parentKey" FROM "product" AS "product" Left JOIN "product_class" AS "product_class" ON "product"."product_class_id" = "product_class"."product_class_id" GROUP BY "product_class"."product_class_id", "product"."product_id", "product"."product_name"'
    ])
  })

  it('Members for Degenerate Dimension', () => {
    const statement = DimensionMembers(
      ENTITY_TYPE_SALESORDER.name,
      { dimension: '[Payment method]' },
      ENTITY_TYPE_SALESORDER,
      { name: 'Sales', dimensions: [PRODUCT_DIMENSION], cubes: [CUBE_SALESORDER] },
      'pg'
    )
    expect(statement).toEqual([
      'SELECT \'[(All)]\' AS "memberKey", \'All\' AS "memberCaption" FROM "product" AS "product" Left JOIN "product_class" AS "product_class" ON "product"."product_class_id" = "product_class"."product_class_id" GROUP BY 1',
      'SELECT concat(\'[\', "product_class"."product_class_id",\']\') AS "memberKey", concat(\'C_\', product_class.product_class_id) AS "memberCaption", \'[(All)]\' AS "parentKey" FROM "product" AS "product" Left JOIN "product_class" AS "product_class" ON "product"."product_class_id" = "product_class"."product_class_id" GROUP BY "product_class"."product_class_id", "product"."product_class_id"',
      'SELECT concat(\'[\', "product_class"."product_class_id",\'].[\',"product"."product_id",\']\') AS "memberKey", "product"."product_name" AS "memberCaption", concat(\'[\', "product_class"."product_class_id",\']\') AS "parentKey" FROM "product" AS "product" Left JOIN "product_class" AS "product_class" ON "product"."product_class_id" = "product_class"."product_class_id" GROUP BY "product_class"."product_class_id", "product"."product_id", "product"."product_name"'
    ])
  })

  it('Orignal table column members', () => {
    const statement = DimensionMembers(
      'sales_fact',
      { dimension: 'Product' },
      { ...ENTITY_TYPE, name: 'sales_fact' },
      null,
      ''
    )
    expect(statement).toEqual(['SELECT DISTINCT `Product` AS `memberKey` FROM `sales_fact`'])
  })
})

describe('Get Dimension Members for Hive', () => {
  it('Dimension Members', () => {
    const statement = DimensionMembers(
      'Product',
      { dimension: '[Product]' },
      ENTITY_TYPE,
      { name: 'Sales', dimensions: [PRODUCT_DIMENSION] },
      'hive',
      'foodmart'
    )
    expect(statement).toEqual([
      "SELECT concat('[', `product_type`.`product_type_id`,']') AS `memberKey`, `product`.`product_type_id` AS `memberCaption` FROM `foodmart`.`product` AS `product` Left JOIN `foodmart`.`product_class` AS `product_class` ON `product`.`product_class_id` = `product_class`.`product_class_id` Left JOIN `foodmart`.`product_type` AS `product_type` ON `product_class`.`product_type_id` = `product_type`.`product_type_id` GROUP BY `product_type`.`product_type_id`, `product`.`product_type_id`",
      "SELECT concat('[', `product_type`.`product_type_id`,'].[',`product_class`.`product_class_id`,']') AS `memberKey`, concat('C_', product_class.product_class_id) AS `memberCaption`, concat('[', `product_type`.`product_type_id`,']') AS `parentKey` FROM `foodmart`.`product` AS `product` Left JOIN `foodmart`.`product_class` AS `product_class` ON `product`.`product_class_id` = `product_class`.`product_class_id` Left JOIN `foodmart`.`product_type` AS `product_type` ON `product_class`.`product_type_id` = `product_type`.`product_type_id` GROUP BY `product_type`.`product_type_id`, `product_class`.`product_class_id`, `product`.`product_class_id`",
      "SELECT concat('[', `product_type`.`product_type_id`,'].[',`product_class`.`product_class_id`,'].[',`product`.`product_name`,']') AS `memberKey`, `product`.`product_name` AS `memberCaption`, concat('[', `product_type`.`product_type_id`,'].[',`product_class`.`product_class_id`,']') AS `parentKey` FROM `foodmart`.`product` AS `product` Left JOIN `foodmart`.`product_class` AS `product_class` ON `product`.`product_class_id` = `product_class`.`product_class_id` Left JOIN `foodmart`.`product_type` AS `product_type` ON `product_class`.`product_type_id` = `product_type`.`product_type_id` GROUP BY `product_type`.`product_type_id`, `product_class`.`product_class_id`, `product`.`product_name`"
    ])
  })

  it('Dimension Members', () => {
    const statement = DimensionMembers(
      'Product',
      { dimension: '[Product]', hierarchy: '[Product.Class]' },
      ENTITY_TYPE,
      { name: 'Sales', dimensions: [PRODUCT_DIMENSION] },
      'hive',
      'foodmart'
    )
    expect(statement).toEqual([
      "SELECT '[(All)]' AS `memberKey`, 'All' AS `memberCaption` FROM `foodmart`.`product` AS `product` Left JOIN `foodmart`.`product_class` AS `product_class` ON `product`.`product_class_id` = `product_class`.`product_class_id` GROUP BY 1",
      "SELECT concat('[', `product_class`.`product_class_id`,']') AS `memberKey`, concat('C_', product_class.product_class_id) AS `memberCaption`, '[(All)]' AS `parentKey` FROM `foodmart`.`product` AS `product` Left JOIN `foodmart`.`product_class` AS `product_class` ON `product`.`product_class_id` = `product_class`.`product_class_id` GROUP BY `product_class`.`product_class_id`, `product`.`product_class_id`",
      "SELECT concat('[', `product_class`.`product_class_id`,'].[',`product`.`product_id`,']') AS `memberKey`, `product`.`product_name` AS `memberCaption`, concat('[', `product_class`.`product_class_id`,']') AS `parentKey` FROM `foodmart`.`product` AS `product` Left JOIN `foodmart`.`product_class` AS `product_class` ON `product`.`product_class_id` = `product_class`.`product_class_id` GROUP BY `product_class`.`product_class_id`, `product`.`product_id`, `product`.`product_name`"
    ])
  })

  it('Orignal table column members', () => {
    const statement = DimensionMembers(
      'sales_fact',
      { dimension: 'Product' },
      { ...ENTITY_TYPE, name: 'sales_fact' },
      null,
      'hive',
      'foodmart'
    )
    expect(statement).toEqual(['SELECT DISTINCT `Product` AS `memberKey` FROM `foodmart`.`sales_fact`'])
  })
})
