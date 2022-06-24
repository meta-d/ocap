import { AggregationRole, C_MEASURES, PropertyDimension, serializeUniqueName } from '@metad/ocap-core'
import { compileDimensionSchema, queryDimension } from './dimension'
import { C_MEASURES_ROW_COUNT } from './types'

export const PRODUCT_DIMENSION: PropertyDimension = {
  name: 'Product',
  hierarchies: [
    {
      name: '',
      tables: [
        {
          name: 'product'
        },
        {
          name: 'product_class',
          join: {
            type: 'Left',
            fields: [
              {
                leftKey: 'product_class_id',
                rightKey: 'product_class_id'
              }
            ]
          }
        },
        {
          name: 'product_type',
          join: {
            type: 'Left',
            fields: [
              {
                leftKey: 'product_type_id',
                rightKey: 'product_type_id'
              }
            ]
          }
        }
      ],
      levels: [
        {
          name: 'Product Type',
          column: 'product_type_id',
          table: 'product_type'
        },
        {
          name: 'Product Class',
          column: 'product_class_id',
          table: 'product_class',
          captionExpression: {
            sql: {
              dialect: 'generic',
              content: `concat('C_', product_class.product_class_id)`
            }
          },
          properties: [
            {
              name: 'Category',
              column: 'product_category'
            }
          ]
        },
        {
          name: 'Product',
          column: 'product_id',
          table: 'product',
          nameColumn: 'product_name',
          properties: [
            {
              name: 'Shelf Width',
              column: 'shelf_width'
            },
            {
              name: 'Units PerCase',
              column: 'units_per_case'
            }
          ]
        }
      ]
    },
    {
      name: 'Class',
      tables: [
        {
          name: 'product'
        },
        {
          name: 'product_class',
          join: {
            type: 'Left',
            fields: [
              {
                leftKey: 'product_class_id',
                rightKey: 'product_class_id'
              }
            ]
          }
        }
      ],
      levels: [
        {
          name: 'Class',
          column: 'product_class_id',
          table: 'product_class',
          captionExpression: {
            sql: {
              dialect: 'generic',
              content: `concat('C_', product_class.product_class_id)`
            }
          },
          properties: [
            {
              name: 'Category',
              column: 'product_category'
            }
          ]
        },
        {
          name: 'Product Id',
          column: 'product_id',
          table: 'product',
          captionColumn: 'product_name',
          properties: [
            {
              name: 'Shelf Width',
              column: 'shelf_width'
            },
            {
              name: 'Units PerCase',
              column: 'units_per_case'
            }
          ]
        }
      ]
    }
  ]
}

export const EMPLOYEE_DIMENSION: PropertyDimension = {
  name: 'Employee',
  hierarchies: [
    {
      name: '',
      tables: [{ name: 'employee' }],
      levels: [
        {
          name: 'Name',
          column: 'employee_id',
          nameColumn: 'full_name',
          parentColumn: 'supervisor_id'
        }
      ]
    }
  ]
}

const ENTITY_TYPE = {
  name: PRODUCT_DIMENSION.name,
  properties: {
    [serializeUniqueName(PRODUCT_DIMENSION.name)]: compileDimensionSchema(PRODUCT_DIMENSION.name, PRODUCT_DIMENSION),
    [serializeUniqueName(EMPLOYEE_DIMENSION.name)]: compileDimensionSchema(EMPLOYEE_DIMENSION.name, EMPLOYEE_DIMENSION)
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
      `SELECT \`product_type\`.\`product_type_id\` AS \`[Product].[Product Type]\`,` +
        ` \`product_class\`.\`product_class_id\` AS \`[Product].[Product Class]\`,` +
        ` concat('C_', product_class.product_class_id) AS \`[Product].[Product Class].[MEMBER_CAPTION]\`,` +
        ` \`product\`.\`product_name\` AS \`[Product].[Product]\`,` +
        ` \`product\`.\`product_name\` AS \`[Product].[Product].[MEMBER_CAPTION]\`` +
        ` FROM \`product\` AS \`product\` Left JOIN \`product_class\` AS \`product_class\`` +
        ` ON \`product\`.\`product_class_id\` = \`product_class\`.\`product_class_id\`` +
        ` Left JOIN \`product_type\` AS \`product_type\` ON \`product_class\`.\`product_type_id\` = \`product_type\`.\`product_type_id\``
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
      `SELECT \`product_type\`.\`product_type_id\` AS \`[Product].[Product Type]\`,` +
        ` \`product_class\`.\`product_class_id\` AS \`[Product].[Product Class]\`,` +
        ` concat('C_', product_class.product_class_id) AS \`[Product].[Product Class].[MEMBER_CAPTION]\`,` +
        ` \`product\`.\`product_name\` AS \`[Product].[Product]\`,` +
        ` \`product\`.\`product_name\` AS \`[Product].[Product].[MEMBER_CAPTION]\`,` +
        ` SUM(1) AS \`Measures_Row_Count\`` +
        ` FROM \`product\` AS \`product\` Left JOIN \`product_class\` AS \`product_class\`` +
        ` ON \`product\`.\`product_class_id\` = \`product_class\`.\`product_class_id\`` +
        ` Left JOIN \`product_type\` AS \`product_type\` ON \`product_class\`.\`product_type_id\` = \`product_type\`.\`product_type_id\`` +
        ` GROUP BY \`product_type\`.\`product_type_id\`, \`product_class\`.\`product_class_id\`, \`product\`.\`product_name\``
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
      `SELECT` +
        ` \`product_class\`.\`product_class_id\` AS \`[Product.Class].[Class]\`,` +
        ` concat('C_', product_class.product_class_id) AS \`[Product.Class].[Class].[MEMBER_CAPTION]\`,` +
        ` \`product\`.\`product_id\` AS \`[Product.Class].[Product Id]\`,` +
        ` \`product\`.\`product_name\` AS \`[Product.Class].[Product Id].[MEMBER_CAPTION]\`,` +
        ` SUM(1) AS \`Measures_Row_Count\`` +
        ` FROM \`product\` AS \`product\` Left JOIN \`product_class\` AS \`product_class\`` +
        ` ON \`product\`.\`product_class_id\` = \`product_class\`.\`product_class_id\`` +
        ` GROUP BY \`product_class\`.\`product_class_id\`, \`product\`.\`product_id\`,` +
        ` \`product\`.\`product_name\``
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
      `SELECT "product_class"."product_class_id" AS "[Product.Class].[Class]",` +
        ` concat('C_', product_class.product_class_id) AS "[Product.Class].[Class].[MEMBER_CAPTION]",` +
        ` "product"."product_id" AS "[Product.Class].[Product Id]",` +
        ` "product"."product_name" AS "[Product.Class].[Product Id].[MEMBER_CAPTION]",` +
        ` SUM(1) AS "Measures_Row_Count"` +
        ` FROM "product" AS "product" Left JOIN "product_class" AS "product_class"` +
        ` ON "product"."product_class_id" = "product_class"."product_class_id"` +
        ` GROUP BY "product_class"."product_class_id", "product"."product_id", "product"."product_name"`
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
      `SELECT \`product_type\`.\`product_type_id\` AS \`[Product].[Product Type]\`,` +
        ` \`product_class\`.\`product_class_id\` AS \`[Product].[Product Class]\`,` +
        ` concat('C_', product_class.product_class_id) AS \`[Product].[Product Class].[MEMBER_CAPTION]\`,` +
        ` \`product\`.\`product_name\` AS \`[Product].[Product]\`,` +
        ` \`product\`.\`product_name\` AS \`[Product].[Product].[MEMBER_CAPTION]\`,` +
        ` \`product\`.\`shelf_width\` AS \`[Product].[Shelf Width]\`` +
        ` FROM \`product\` AS \`product\` Left JOIN \`product_class\` AS \`product_class\`` +
        ` ON \`product\`.\`product_class_id\` = \`product_class\`.\`product_class_id\`` +
        ` Left JOIN \`product_type\` AS \`product_type\` ON \`product_class\`.\`product_type_id\` = \`product_type\`.\`product_type_id\``
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
      `SELECT \`product_type\`.\`product_type_id\` AS \`[Product].[Product Type]\`,` +
        ` \`product_class\`.\`product_class_id\` AS \`[Product].[Product Class]\`,` +
        ` concat('C_', product_class.product_class_id) AS \`[Product].[Product Class].[MEMBER_CAPTION]\`,` +
        ` \`product\`.\`product_name\` AS \`[Product].[Product]\`,` +
        ` \`product\`.\`product_name\` AS \`[Product].[Product].[MEMBER_CAPTION]\`,` +
        ` \`product\`.\`shelf_width\` AS \`[Product].[Shelf Width]\`, SUM(1) AS \`Measures_Row_Count\`` +
        ` FROM \`product\` AS \`product\` Left JOIN \`product_class\` AS \`product_class\`` +
        ` ON \`product\`.\`product_class_id\` = \`product_class\`.\`product_class_id\`` +
        ` Left JOIN \`product_type\` AS \`product_type\` ON \`product_class\`.\`product_type_id\` = \`product_type\`.\`product_type_id\`` +
        ` GROUP BY \`product_type\`.\`product_type_id\`, \`product_class\`.\`product_class_id\`,` +
        ` \`product\`.\`product_name\`, \`product\`.\`shelf_width\``
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
      'SELECT `employee`.`full_name` AS `[Employee].[Name]`,' +
        ' `employee`.`full_name` AS `[Employee].[Name].[MEMBER_CAPTION]`,' +
        ' `employee(1)`.`full_name` AS `[Employee].[Name].[PARENT_UNIQUE_NAME]`' +
        ' FROM `employee` AS `employee` Left JOIN `employee` AS `employee(1)`' + 
        ' ON `employee`.`supervisor_id` = `employee(1)`.`employee_id`'
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
      'SELECT `employee`.`full_name` AS `[Employee].[Name]`,' +
        ' `employee`.`full_name` AS `[Employee].[Name].[MEMBER_CAPTION]`,' +
        ' `employee(1)`.`full_name` AS `[Employee].[Name].[PARENT_UNIQUE_NAME]`' +
        ', SUM(1) AS `Measures_Row_Count`' +
        ' FROM `employee` AS `employee` Left JOIN `employee` AS `employee(1)`' + 
        ' ON `employee`.`supervisor_id` = `employee(1)`.`employee_id`'+
        ' GROUP BY `employee`.`full_name`, `employee(1)`.`full_name`'
    )
  })

  it('Query Dimension with Count Measure pg', () => {
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
      }, 'pg')
    ).toEqual(
      'SELECT "employee"."full_name" AS "[Employee].[Name]",' +
      ' "employee"."full_name" AS "[Employee].[Name].[MEMBER_CAPTION]",' +
      ' "employee(1)"."full_name" AS "[Employee].[Name].[PARENT_UNIQUE_NAME]"' +
      ', SUM(1) AS "Measures_Row_Count"' +
      ' FROM "employee" AS "employee" Left JOIN "employee" AS "employee(1)"' + 
      ' ON "employee"."supervisor_id" = "employee(1)"."employee_id"'+
      ' GROUP BY "employee"."full_name", "employee(1)"."full_name"'
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
      hierarchies: [
        {
          entity: 'Product',
          levels: [
            {
              column: 'product_type_id',
              entity: 'Product',
              name: '[Product].[Product Type]',
              caption: null,
              properties: undefined,
              table: 'product_type'
            },
            {
              column: 'product_class_id',
              entity: 'Product',
              name: '[Product].[Product Class]',
              caption: null,
              properties: [{ column: 'product_category', label: 'Category', name: '[Product].[Category]' }],
              table: 'product_class',
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
              name: '[Product].[Product]',
              caption: '[Product].[Product].[MEMBER_CAPTION]',
              nameColumn: 'product_name',
              properties: [
                { column: 'shelf_width', label: 'Shelf Width', name: '[Product].[Shelf Width]' },
                { column: 'units_per_case', label: 'Units PerCase', name: '[Product].[Units PerCase]' }
              ],
              table: 'product'
            }
          ],
          name: '[Product]',
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
          ]
        },
        {
          entity: 'Product',
          levels: [
            {
              column: 'product_class_id',
              entity: 'Product',
              name: '[Product.Class].[Class]',
              caption: null,
              properties: [{ column: 'product_category', label: 'Category', name: '[Product.Class].[Category]' }],
              table: 'product_class',
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
              name: '[Product.Class].[Product Id]',
              caption: '[Product.Class].[Product Id].[MEMBER_CAPTION]',
              properties: [
                { column: 'shelf_width', label: 'Shelf Width', name: '[Product.Class].[Shelf Width]' },
                { column: 'units_per_case', label: 'Units PerCase', name: '[Product.Class].[Units PerCase]' }
              ],
              table: 'product',
              captionColumn: 'product_name'
            }
          ],
          name: '[Product.Class]',
          tables: [
            { name: 'product' },
            {
              join: { fields: [{ leftKey: 'product_class_id', rightKey: 'product_class_id' }], type: 'Left' },
              name: 'product_class'
            }
          ]
        }
      ],
      role: 'dimension'
    })

    expect(compileDimensionSchema(EMPLOYEE_DIMENSION.name, EMPLOYEE_DIMENSION)).toEqual({
      entity: 'Employee',
      name: '[Employee]',
      hierarchies: [
        {
          name: '[Employee]',
          entity: 'Employee',
          tables: [{ name: 'employee' }],
          levels: [
            {
              entity: 'Employee',
              name: '[Employee].[Name]',
              caption: '[Employee].[Name].[MEMBER_CAPTION]',
              column: 'employee_id',
              nameColumn: 'full_name',
              parentColumn: 'supervisor_id',
              properties: undefined
            }
          ]
        }
      ],
      role: AggregationRole.dimension
    })
  })
})
