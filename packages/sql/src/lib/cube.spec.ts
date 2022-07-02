import {
  AggregationRole,
  CalculationProperty,
  Cube,
  C_MEASURES,
  DimensionType,
  EntityProperty,
  EntityType,
  PropertyDimension,
  Semantics
} from '@metad/ocap-core'
import { buildCubeContext, compileCubeSchema } from './cube'

export const SHARED_DIMENSION_TIME: PropertyDimension = {
  __id__: '590d2e4a-ef71-49e4-b53f-36100cc5b004',
  name: 'Time',
  label: '日历',
  type: DimensionType.TimeDimension,
  semantics: {
    semantic: Semantics.Calendar
  },
  hierarchies: [
    {
      __id__: 'cfdc9bab-46e4-4220-8cdf-44f1b5c7145c',
      name: '',
      label: '日历',
      hasAll: true,
      primaryKey: 'time_id',
      tables: [{ name: 'time_by_day' }],
      levels: [
        {
          __id__: 'c3dc9239-8729-40bb-8e28-1c0a05d29834',
          column: 'the_year',
          name: 'Year',
          label: '年',
          uniqueMembers: true,
          nameColumn: null,
          parentColumn: null,
          nullParentValue: null,
          levelType: 'TimeYears',
          semantics: {
            semantic: Semantics['Calendar.Year'],
            formatter: '[yyyy]'
          }
        },
        {
          __id__: 'b5a0d2b8-c853-4480-bbaa-59a073b53047',
          column: 'quarter',
          name: 'Quarter',
          label: '季度',
          uniqueMembers: null,
          nameColumn: null,
          parentColumn: null,
          nullParentValue: null,
          levelType: 'TimeQuarters',
          semantics: {
            semantic: Semantics['Calendar.Quarter'],
            formatter: "[yyyy].['Q'Q]"
          },
          captionColumn: null,
          ordinalColumn: null,
          captionExpression: {
            sql: { dialect: 'generic', content: '"the_year" || "quarter"' }
          }
        },
        {
          __id__: 'cc0f564e-73ef-4761-bac7-2daa83cb7487',
          column: 'month_of_year',
          name: 'Month',
          label: '月',
          nameColumn: null,
          uniqueMembers: null,
          parentColumn: null,
          nullParentValue: null,
          levelType: 'TimeMonths',
          semantics: {
            semantic: Semantics['Calendar.Month'],
            formatter: "[yyyy].['Q'Q].[M]"
          },
          captionColumn: 'the_month',
          ordinalColumn: 'month_of_year'
        },
        {
          __id__: 'a8f5b556-e278-42ba-8b8d-fcfdab8538c2',
          column: 'the_date',
          name: 'Day',
          label: '日期',
          uniqueMembers: true,
          nameColumn: null,
          parentColumn: null,
          nullParentValue: null,
          levelType: 'TimeDays',
          semantics: {
            semantic: Semantics['Calendar.Day'],
            formatter: "[yyyy].['Q'Q].[M].[yyyy-MM-dd]"
          }
        }
      ]
    },
    {
      __id__: '121096fb-bf4e-42c4-a776-c52c87fcf73c',
      label: '周日历',
      hasAll: true,
      name: 'Weekly',
      allMemberName: null,
      tables: [{ name: 'time_by_day' }],
      primaryKey: 'time_id',
      levels: [
        {
          __id__: '651b5863-ade3-4e97-a384-f9d778550927',
          column: 'the_year',
          name: 'Year',
          label: '年',
          uniqueMembers: true,
          nameColumn: null,
          captionColumn: null,
          parentColumn: null,
          nullParentValue: null,
          levelType: 'TimeYears',
          semantics: { semantic: Semantics['Calendar.Year'] }
        },
        {
          __id__: '3a35e9a2-b908-404a-bb11-8ba8404b1cfd',
          column: 'week_of_year',
          name: 'Week',
          label: '周',
          uniqueMembers: null,
          nameColumn: null,
          captionColumn: null,
          parentColumn: null,
          nullParentValue: null,
          levelType: 'TimeWeeks',
          semantics: {
            semantic: Semantics['Calendar.Week'],
            formatter: '[yyyy].[W]'
          }
        },
        {
          __id__: '381b0a26-dbc1-41bb-bc5d-d9c61c17d9f0',
          column: 'day_of_month',
          name: 'Day',
          label: '日',
          uniqueMembers: null,
          nameColumn: null,
          captionColumn: null,
          parentColumn: null,
          nullParentValue: null,
          levelType: 'TimeDays',
          semantics: {
            semantic: Semantics['Calendar.Day'],
            formatter: '[yyyy].[W].[Do]'
          }
        }
      ]
    }
  ]
}

export const CUBE_SALESORDER: Cube = {
  name: 'SalesOrder',
  label: '销售订单',
  tables: [{ name: 'sales_fact' }],
  dimensionUsages: [
    {
      __id__: '22f3cdd3-c6d6-42a1-a312-6d75c7b40d8b',
      name: 'Time',
      source: 'Time',
      foreignKey: 'time_id'
    }
  ],
  dimensions: [
    {
      __id__: '3571a32a-1365-4e7f-875e-6520537f5b48',
      name: 'Product',
      label: '产品',
      foreignKey: 'product_id',
      hierarchies: [
        {
          name: '',
          __id__: '8531da03-2485-4281-ba4f-678c0fb25e15',
          label: '产品',
          hasAll: true,
          primaryKey: 'product_id',
          tables: [{ name: 'product' }],
          levels: [
            {
              __id__: '1e8f6622-6ce2-4187-8ae6-0be581614804',
              column: 'brand_name',
              properties: [],
              name: 'Brand Name',
              label: '品牌',
              uniqueMembers: true,
              nameColumn: null,
              captionColumn: null,
              ordinalColumn: null,
              parentColumn: null,
              nullParentValue: null,
              table: 'product'
            },
            {
              __id__: 'c13911a4-d8b2-486e-afc7-894c21079b95',
              column: 'product_id',
              properties: [
                {
                  column: 'SKU',
                  name: 'SKU'
                },
                {
                  column: 'gross_weight',
                  name: 'Gross Weight'
                },
                {
                  column: 'shelf_width',
                  name: 'Shelf Width'
                }
              ],
              name: 'Product',
              label: '产品',
              nameColumn: 'product_name',
              uniqueMembers: null,
              captionColumn: null,
              ordinalColumn: null,
              parentColumn: null,
              nullParentValue: null,
              table: 'product'
            }
          ]
        }
      ]
    },
    {
      name: 'Payment method',
      hierarchies: [
        {
          name: '',
          hasAll: true,
          levels: [
            {
              name: 'Payment method',
              column: 'payment_method',
              uniqueMembers: true
            }
          ]
        }
      ]
    }
  ],
  measures: [
    {
      __id__: '1c05abfc-56e1-46c8-a312-01a4915b1ff9',
      name: 'Sales',
      aggregator: 'sum',
      column: 'store_sales',
      caption: 'Sales'
    },
    {
      __id__: 'a1eebb49-c622-455f-b43e-f35764757e2f',
      name: 'Cost',
      aggregator: 'sum',
      caption: 'Cost',
      column: 'store_cost'
    }
  ],
  calculatedMembers: [
    {
      __id__: 'bmSRyRTE8h',
      name: 'Profit',
      dimension: 'Measures',
      formula: '`sales_fact`.`store_sales` - `sales_fact`.`store_cost`',
      label: '利润',
      visible: true,
      properties: []
    }
  ]
}

export const ENTITY_TYPE_SALESORDER: EntityType = {
  name: 'SalesOrder',
  label: '销售订单',
  properties: {
    '[Time]': {
      __id__: '590d2e4a-ef71-49e4-b53f-36100cc5b004',
      entity: 'SalesOrder',
      name: '[Time]',
      label: '日历',
      type: 'TimeDimension',
      foreignKey: 'time_id',
      role: AggregationRole.dimension,
      semantics: {
        semantic: Semantics.Calendar
      },
      hierarchies: [
        {
          __id__: 'cfdc9bab-46e4-4220-8cdf-44f1b5c7145c',
          entity: 'SalesOrder',
          dimension: '[Time]',
          name: '[Time]',
          label: '日历',
          caption: '[Time].[MEMBER_CAPTION]',
          primaryKey: 'time_id',
          hasAll: true,
          role: AggregationRole.hierarchy,
          tables: [
            {
              name: 'time_by_day'
            }
          ],

          levels: [
            {
              entity: 'SalesOrder',
              dimension: '[Time]',
              hierarchy: '[Time]',
              name: '[Time].[(All Times)]',
              caption: '[Time].[(All Times)].[MEMBER_CAPTION]',
              levelNumber: 0,
              role: AggregationRole.level,
              properties: []
            },
            {
              __id__: 'c3dc9239-8729-40bb-8e28-1c0a05d29834',
              caption: '[Time].[Year].[MEMBER_CAPTION]',
              column: 'the_year',
              entity: 'SalesOrder',
              dimension: '[Time]',
              hierarchy: '[Time]',
              label: '年',
              levelType: 'TimeYears',
              name: '[Time].[Year]',
              nameColumn: null,
              nullParentValue: null,
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
              levelNumber: 1,
              semantics: {
                formatter: '[yyyy]',
                semantic: Semantics['Calendar.Year']
              },
              uniqueMembers: true
            },
            {
              __id__: 'b5a0d2b8-c853-4480-bbaa-59a073b53047',
              caption: '[Time].[Quarter].[MEMBER_CAPTION]',
              captionColumn: null,
              captionExpression: {
                sql: {
                  content: '"the_year" || "quarter"',
                  dialect: 'generic'
                }
              },
              column: 'quarter',
              entity: 'SalesOrder',
              dimension: '[Time]',
              hierarchy: '[Time]',
              label: '季度',
              levelType: 'TimeQuarters',
              name: '[Time].[Quarter]',
              nameColumn: null,
              nullParentValue: null,
              ordinalColumn: null,
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
              levelNumber: 2,
              semantics: {
                formatter: "[yyyy].['Q'Q]",
                semantic: Semantics['Calendar.Quarter']
              },
              uniqueMembers: null
            },
            {
              __id__: 'cc0f564e-73ef-4761-bac7-2daa83cb7487',
              caption: '[Time].[Month].[MEMBER_CAPTION]',
              captionColumn: 'the_month',
              column: 'month_of_year',
              entity: 'SalesOrder',
              dimension: '[Time]',
              hierarchy: '[Time]',
              label: '月',
              levelType: 'TimeMonths',
              name: '[Time].[Month]',
              nameColumn: null,
              nullParentValue: null,
              ordinalColumn: 'month_of_year',
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
              levelNumber: 3,
              semantics: {
                formatter: "[yyyy].['Q'Q].[M]",
                semantic: Semantics['Calendar.Month']
              },
              uniqueMembers: null
            },
            {
              __id__: 'a8f5b556-e278-42ba-8b8d-fcfdab8538c2',
              caption: '[Time].[Day].[MEMBER_CAPTION]',
              column: 'the_date',
              entity: 'SalesOrder',
              dimension: '[Time]',
              hierarchy: '[Time]',
              label: '日期',
              levelType: 'TimeDays',
              name: '[Time].[Day]',
              nameColumn: null,
              nullParentValue: null,
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
              levelNumber: 4,
              semantics: {
                formatter: "[yyyy].['Q'Q].[M].[yyyy-MM-dd]",
                semantic: Semantics['Calendar.Day']
              },
              uniqueMembers: true
            }
          ]
        },
        {
          __id__: '121096fb-bf4e-42c4-a776-c52c87fcf73c',
          allMemberName: null,
          entity: 'SalesOrder',
          dimension: '[Time]',
          name: '[Time.Weekly]',
          caption: '[Time.Weekly].[MEMBER_CAPTION]',
          primaryKey: 'time_id',
          role: AggregationRole.hierarchy,
          hasAll: true,
          label: '周日历',
          tables: [
            {
              name: 'time_by_day'
            }
          ],
          levels: [
            {
              entity: 'SalesOrder',
              dimension: '[Time]',
              hierarchy: '[Time.Weekly]',
              name: '[Time.Weekly].[(All Weeklys)]',
              caption: '[Time.Weekly].[(All Weeklys)].[MEMBER_CAPTION]',
              levelNumber: 0,
              role: AggregationRole.level,
              properties: []
            },
            {
              __id__: '651b5863-ade3-4e97-a384-f9d778550927',
              caption: '[Time.Weekly].[Year].[MEMBER_CAPTION]',
              captionColumn: null,
              column: 'the_year',
              entity: 'SalesOrder',
              dimension: '[Time]',
              hierarchy: '[Time.Weekly]',
              label: '年',
              levelType: 'TimeYears',
              name: '[Time.Weekly].[Year]',
              nameColumn: null,
              nullParentValue: null,
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
              levelNumber: 1,
              semantics: {
                semantic: Semantics['Calendar.Year']
              },
              uniqueMembers: true
            },
            {
              __id__: '3a35e9a2-b908-404a-bb11-8ba8404b1cfd',
              caption: '[Time.Weekly].[Week].[MEMBER_CAPTION]',
              captionColumn: null,
              column: 'week_of_year',
              entity: 'SalesOrder',
              dimension: '[Time]',
              hierarchy: '[Time.Weekly]',
              label: '周',
              levelType: 'TimeWeeks',
              name: '[Time.Weekly].[Week]',
              nameColumn: null,
              nullParentValue: null,
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
              levelNumber: 2,
              semantics: {
                formatter: '[yyyy].[W]',
                semantic: Semantics['Calendar.Week']
              },
              uniqueMembers: null
            },
            {
              __id__: '381b0a26-dbc1-41bb-bc5d-d9c61c17d9f0',
              caption: '[Time.Weekly].[Day].[MEMBER_CAPTION]',
              captionColumn: null,
              column: 'day_of_month',
              entity: 'SalesOrder',
              dimension: '[Time]',
              hierarchy: '[Time.Weekly]',
              label: '日',
              levelType: 'TimeDays',
              name: '[Time.Weekly].[Day]',
              nameColumn: null,
              nullParentValue: null,
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
              levelNumber: 3,
              semantics: {
                formatter: '[yyyy].[W].[Do]',
                semantic: Semantics['Calendar.Day']
              },
              uniqueMembers: null
            }
          ]
        }
      ]
    },
    '[Product]': {
      __id__: '3571a32a-1365-4e7f-875e-6520537f5b48',
      entity: 'SalesOrder',
      name: '[Product]',
      label: '产品',
      role: AggregationRole.dimension,
      foreignKey: 'product_id',
      hierarchies: [
        {
          __id__: '8531da03-2485-4281-ba4f-678c0fb25e15',
          entity: 'SalesOrder',
          dimension: '[Product]',
          name: '[Product]',
          label: '产品',
          caption: '[Product].[MEMBER_CAPTION]',
          tables: [
            {
              name: 'product'
            }
          ],
          primaryKey: 'product_id',
          hasAll: true,
          role: AggregationRole.hierarchy,
          levels: [
            {
              caption: '[Product].[(All Products)].[MEMBER_CAPTION]',
              entity: 'SalesOrder',
              dimension: '[Product]',
              hierarchy: '[Product]',
              levelNumber: 0,
              name: '[Product].[(All Products)]',
              properties: [],
              role: AggregationRole.level
            },
            {
              __id__: '1e8f6622-6ce2-4187-8ae6-0be581614804',
              caption: '[Product].[Brand Name].[MEMBER_CAPTION]',
              captionColumn: null,
              column: 'brand_name',
              entity: 'SalesOrder',
              dimension: '[Product]',
              hierarchy: '[Product]',
              label: '品牌',
              name: '[Product].[Brand Name]',
              nameColumn: null,
              nullParentValue: null,
              ordinalColumn: null,
              parentColumn: null,
              properties: [],
              table: 'product',
              uniqueMembers: true,
              role: AggregationRole.level,
              levelNumber: 1
            },
            {
              __id__: 'c13911a4-d8b2-486e-afc7-894c21079b95',
              caption: '[Product].[Product].[MEMBER_CAPTION]',
              captionColumn: null,
              column: 'product_id',
              entity: 'SalesOrder',
              dimension: '[Product]',
              hierarchy: '[Product]',
              label: '产品',
              name: '[Product].[Product]',
              nameColumn: 'product_name',
              nullParentValue: null,
              ordinalColumn: null,
              parentColumn: null,
              levelNumber: 2,
              properties: [
                {
                  column: 'SKU',
                  label: 'SKU',
                  name: '[Product].[SKU]'
                },
                {
                  column: 'gross_weight',
                  label: 'Gross Weight',
                  name: '[Product].[Gross Weight]'
                },
                {
                  column: 'shelf_width',
                  label: 'Shelf Width',
                  name: '[Product].[Shelf Width]'
                }
              ],
              table: 'product',
              uniqueMembers: null,
              role: AggregationRole.level
            }
          ]
        }
      ]
    },
    '[Payment method]': {
      entity: 'SalesOrder',
      name: '[Payment method]',
      role: AggregationRole.dimension,
      hierarchies: [
        {
          entity: 'SalesOrder',
          dimension: '[Payment method]',
          name: '[Payment method]',
          caption: '[Payment method].[MEMBER_CAPTION]',
          role: AggregationRole.hierarchy,
          hasAll: true,
          levels: [
            {
              entity: 'SalesOrder',
              dimension: '[Payment method]',
              hierarchy: '[Payment method]',
              name: '[Payment method].[(All Payment methods)]',
              caption: '[Payment method].[(All Payment methods)].[MEMBER_CAPTION]',
              levelNumber: 0,
              role: AggregationRole.level,
              properties: []
            },
            {
              entity: 'SalesOrder',
              dimension: '[Payment method]',
              hierarchy: '[Payment method]',
              name: '[Payment method].[Payment method]',
              caption: '[Payment method].[Payment method].[MEMBER_CAPTION]',
              role: AggregationRole.level,
              column: 'payment_method',
              uniqueMembers: true,
              properties: undefined,
              levelNumber: 1
            }
          ]
        }
      ]
    },
    Cost: {
      __id__: 'a1eebb49-c622-455f-b43e-f35764757e2f',
      aggregator: 'sum',
      caption: 'Cost',
      column: 'store_cost',
      name: 'Cost',
      role: AggregationRole.measure
    } as EntityProperty,
    Sales: {
      __id__: '1c05abfc-56e1-46c8-a312-01a4915b1ff9',
      aggregator: 'sum',
      caption: 'Sales',
      column: 'store_sales',
      name: 'Sales',
      role: AggregationRole.measure
    } as EntityProperty,
    Profit: {
      __id__: 'bmSRyRTE8h',
      calculationType: 'Calculated',
      dataType: 'number',
      dimension: 'Measures',
      formula: '`sales_fact`.`store_sales` - `sales_fact`.`store_cost`',
      label: '利润',
      name: 'Profit',
      properties: [],
      role: AggregationRole.measure,
      visible: true
    } as CalculationProperty
  }
}

describe('SQL Cube', () => {
  beforeAll(() => {
    //
  })

  it('Query Cube', () => {
    expect(compileCubeSchema(CUBE_SALESORDER.name, CUBE_SALESORDER, [SHARED_DIMENSION_TIME])).toEqual(
      ENTITY_TYPE_SALESORDER
    )
  })

  it('Build Cube Context', () => {
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
    expect(cubeContext.dimensions[0].selectFields).toEqual([
      {
        alias: '[Time.Weekly]',
        columns: [
          {
            table: 'time_by_day',
            column: 'the_year'
          },
          {
            table: 'time_by_day',
            column: 'week_of_year'
          }
        ],
        table: 'time_by_day'
      },
      {
        table: 'time_by_day',
        column: 'week_of_year',
        alias: '[Time.Weekly].[MEMBER_CAPTION]'
      }
    ])
  })

  it('Build cube context with Degenerate dimension', () => {
    const cubeContext = buildCubeContext(
      CUBE_SALESORDER,
      {
        rows: [
          {
            dimension: '[Payment method]',
            hierarchy: '[Payment method]',
            level: '[Payment method].[Payment method]'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )
    expect(cubeContext.dimensions[0].selectFields).toEqual([
      {
        alias: '[Payment method]',
        columns: [
          {
            column: 'payment_method',
            table: 'sales_fact'
          }
        ],
        table: 'sales_fact'
      },
      {
        alias: '[Payment method].[MEMBER_CAPTION]',
        column: 'payment_method',
        table: 'sales_fact'
      }
    ])
  })

  it('with Calculated Member', () => {
    const cubeContext = buildCubeContext(
      CUBE_SALESORDER,
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
            measure: 'Profit'
          }
        ]
      },
      ENTITY_TYPE_SALESORDER,
      ''
    )
    expect((cubeContext.measures[0] as unknown as CalculationProperty).calculationType).toEqual('Calculated')
  })
})
