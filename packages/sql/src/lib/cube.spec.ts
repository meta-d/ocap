import {
  AggregationRole,
  Cube,
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
  ]
}

export const ENTITY_TYPE_SALESORDER: EntityType = {
  name: 'SalesOrder',
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
          name: '[Time]',
          label: '日历',
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
              __id__: 'c3dc9239-8729-40bb-8e28-1c0a05d29834',
              caption: null,
              column: 'the_year',
              entity: 'SalesOrder',
              label: '年',
              levelType: 'TimeYears',
              name: '[Time].[Year]',
              nameColumn: null,
              nullParentValue: null,
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
              semantics: {
                formatter: '[yyyy]',
                semantic: Semantics['Calendar.Year']
              },
              uniqueMembers: true
            },
            {
              __id__: 'b5a0d2b8-c853-4480-bbaa-59a073b53047',
              caption: null,
              captionColumn: null,
              captionExpression: {
                sql: {
                  content: '"the_year" || "quarter"',
                  dialect: 'generic'
                }
              },
              column: 'quarter',
              entity: 'SalesOrder',
              label: '季度',
              levelType: 'TimeQuarters',
              name: '[Time].[Quarter]',
              nameColumn: null,
              nullParentValue: null,
              ordinalColumn: null,
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
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
              label: '月',
              levelType: 'TimeMonths',
              name: '[Time].[Month]',
              nameColumn: null,
              nullParentValue: null,
              ordinalColumn: 'month_of_year',
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
              semantics: {
                formatter: "[yyyy].['Q'Q].[M]",
                semantic: Semantics['Calendar.Month']
              },
              uniqueMembers: null
            },
            {
              __id__: 'a8f5b556-e278-42ba-8b8d-fcfdab8538c2',
              caption: null,
              column: 'the_date',
              entity: 'SalesOrder',
              label: '日期',
              levelType: 'TimeDays',
              name: '[Time].[Day]',
              nameColumn: null,
              nullParentValue: null,
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
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
          name: '[Time.Weekly]',
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
              __id__: '651b5863-ade3-4e97-a384-f9d778550927',
              caption: null,
              captionColumn: null,
              column: 'the_year',
              entity: 'SalesOrder',
              label: '年',
              levelType: 'TimeYears',
              name: '[Time.Weekly].[Year]',
              nameColumn: null,
              nullParentValue: null,
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
              semantics: {
                semantic: Semantics['Calendar.Year']
              },
              uniqueMembers: true
            },
            {
              __id__: '3a35e9a2-b908-404a-bb11-8ba8404b1cfd',
              caption: null,
              captionColumn: null,
              column: 'week_of_year',
              entity: 'SalesOrder',
              label: '周',
              levelType: 'TimeWeeks',
              name: '[Time.Weekly].[Week]',
              nameColumn: null,
              nullParentValue: null,
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
              semantics: {
                formatter: '[yyyy].[W]',
                semantic: Semantics['Calendar.Week']
              },
              uniqueMembers: null
            },
            {
              __id__: '381b0a26-dbc1-41bb-bc5d-d9c61c17d9f0',
              caption: null,
              captionColumn: null,
              column: 'day_of_month',
              entity: 'SalesOrder',
              label: '日',
              levelType: 'TimeDays',
              name: '[Time.Weekly].[Day]',
              nameColumn: null,
              nullParentValue: null,
              parentColumn: null,
              properties: undefined,
              role: AggregationRole.level,
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
      hierarchies: [
        {
          __id__: '8531da03-2485-4281-ba4f-678c0fb25e15',
          entity: 'SalesOrder',
          name: '[Product]',
          label: '产品',
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
              __id__: '1e8f6622-6ce2-4187-8ae6-0be581614804',
              caption: null,
              captionColumn: null,
              column: 'brand_name',
              entity: 'SalesOrder',
              label: '品牌',
              name: '[Product].[Brand Name]',
              nameColumn: null,
              nullParentValue: null,
              ordinalColumn: null,
              parentColumn: null,
              properties: [],
              table: 'product',
              uniqueMembers: true,
              role: AggregationRole.level
            },
            {
              __id__: 'c13911a4-d8b2-486e-afc7-894c21079b95',
              caption: '[Product].[Product].[MEMBER_CAPTION]',
              captionColumn: null,
              column: 'product_id',
              entity: 'SalesOrder',
              label: '产品',
              name: '[Product].[Product]',
              nameColumn: 'product_name',
              nullParentValue: null,
              ordinalColumn: null,
              parentColumn: null,
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
    } as EntityProperty
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
    expect(cubeContext.dimensions[0].selectFields).toEqual([
      {
        alias: '[Time.Weekly].[Week]',
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
        alias: '[Time.Weekly].[Week].[MEMBER_CAPTION]',
      }
    ])
  })
})
