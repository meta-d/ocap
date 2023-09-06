import { filter, Observable, of } from 'rxjs'
import { AbstractEntityService } from './abstract-entity.service'
import { PeriodFunctions, Semantics } from './annotations'
import { AbstractDataSource, DataSource, DataSourceOptions, DBCatalog, DBTable } from './data-source'
import { EntityService } from './entity'
import {
  AggregationRole,
  CalculatedProperty,
  Catalog,
  EntitySet,
  EntityType,
  IDimensionMember,
  Indicator,
  isEntityType,
  Property,
  QueryReturn
} from './models'
import { Annotation, AnnotationTerm, C_MEASURES, Dimension, QueryOptions } from './types'
import { cloneDeep } from './utils'


const CALENDAR = {
  __id__: '590d2e4a-ef71-49e4-b53f-36100cc5b004',
  name: 'Time',
  caption: '日历',
  semantics: {
    semantic: Semantics['Calendar']
  },
  hierarchies: [
    {
      __id__: 'cfdc9bab-46e4-4220-8cdf-44f1b5c7145c',
      name: '',
      caption: '日历',
      hasAll: true,
      primaryKey: 'time_id',
      tables: [{ name: 'time_by_day' }],
      levels: [
        {
          __id__: 'c3dc9239-8729-40bb-8e28-1c0a05d29834',
          column: 'the_year',
          name: 'Year',
          caption: '年',
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
          caption: '季度',
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
          ordinalColumn: null
        },
        {
          __id__: 'cc0f564e-73ef-4761-bac7-2daa83cb7487',
          column: 'month_of_year',
          name: 'Month',
          caption: '月',
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
          caption: '日期',
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
      caption: '周日历',
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
          caption: '年',
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
          caption: '周',
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
          caption: '日',
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

export const CUBE_SALES_ORDER = {
  name: 'SalesOrder',
  label: '销售订单',
  tables: [{ name: 'sales_order' }],
  defaultMeasure: 'Sales',
  dimensions: [
    CALENDAR,
    {
      name: 'Product',
      hierarchies: [
        {
          name: '',
          label: '产品',
          levels: [
            {
              name: 'Product',
              column: 'product',
              captionColumn: 'ProductName'
            }
          ]
        }
      ]
    },
    {
      name: 'Department',
      hierarchies: [
        {
          name: '',
          levels: [
            {
              name: 'Department',
              column: 'department',
              captionColumn: 'DepartmentName'
            }
          ]
        }
      ]
    }
  ],
  measures: [
    {
      name: 'Sales',
      column: 'sales'
    }
  ]
}


export const ENTITY_TYPE_SALESORDER: EntityType = {
  name: 'SalesOrder',
  visible: true,
  properties: {
    '[Department]': {
      name: '[Department]',
      role: AggregationRole.dimension,
      hierarchies: [
        {
          name: '[Department]',
          role: AggregationRole.hierarchy
        }
      ]
    },
    '[Time]': {
      name: '[Time]',
      semantics: {
        semantic: Semantics.Calendar
      },
      role: AggregationRole.dimension,
      hierarchies: [
        {
          name: '[Time]',
          role: AggregationRole.hierarchy,
          levels: [
            {
              name: '[Time].[Year]',
              semantics: {
                semantic: Semantics['Calendar.Year']
              }
            },
            {
              name: '[Time].[Month]',
              semantics: {
                semantic: Semantics['Calendar.Month']
              }
            }
          ]
        }
      ]
    },
    sales: {
      name: 'sales',
      role: AggregationRole.measure
    }
  }
}

export class MockDataSource extends AbstractDataSource<DataSourceOptions> {
  override dropEntity(name: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  selectEntitySets(refresh?: boolean): Observable<EntitySet[]> {
    throw new Error('Method not implemented.')
  }
  selectMembers(entity: string, dimension: Dimension): Observable<IDimensionMember[]> {
    throw new Error('Method not implemented.')
  }
  discoverDBCatalogs(): Observable<DBCatalog[]> {
    throw new Error('Method not implemented.')
  }
  discoverDBTables(): Observable<DBTable[]> {
    throw new Error('Method not implemented.')
  }
  discoverMDCubes(refresh?: boolean): Observable<EntitySet[]> {
    throw new Error('Method not implemented.')
  }
  discoverMDMembers(entity: string, dimension: Dimension): Observable<IDimensionMember[]> {
    throw new Error('Method not implemented.')
  }
  createEntityService<T>(entity: string): EntityService<T> {
    return new MockEntityService<T>(this, entity)
  }
  getEntitySets(): Observable<EntitySet[]> {
    throw new Error('Method not implemented.')
  }
  getEntityType(entity: string): Observable<EntityType> {
    return of(cloneDeep(ENTITY_TYPE_SALESORDER))
  }
  getCatalogs(): Observable<Catalog[]> {
    throw new Error('Method not implemented.')
  }
  getMembers(entity: string, dimension: Dimension): Observable<IDimensionMember[]> {
    return of([{} as IDimensionMember])
  }
  createEntity(name: any, columns: any, data?: any): Observable<string> {
    throw new Error('Method not implemented.')
  }
  query({ statement: string }: { statement: any }): Observable<any> {
    throw new Error('Method not implemented.')
  }
}

export class MockEntityService<T> extends AbstractEntityService<T> implements EntityService<T> {

  constructor(dataSource: DataSource, entitySet: string) {
    super(dataSource, entitySet)
  }

  override selectEntityType(): Observable<EntityType> {
    return this.dataSource.selectEntityType(this.entitySet).pipe(filter(isEntityType))
  }

  override query(options?: QueryOptions<T>): Observable<QueryReturn<T>> {
    throw new Error(`Deprecated use selectQuery`)
  }
  override selectQuery(options?: QueryOptions<any>): Observable<QueryReturn<T>> {
    return of({
      data: [],
      options
    })
  }
  override refresh(): void {
    throw new Error('Method not implemented.')
  }
  
  override getAnnotation<AT extends Annotation>(term: AnnotationTerm, qualifier?: string): Observable<AT> {
    throw new Error('Method not implemented.')
  }

  override getMembers(property: Dimension): Observable<IDimensionMember[]> {
    return of([
      {
        memberKey: '[A]',
        dimension: property.dimension,
        hierarchy: property.hierarchy || property.dimension,
        memberCaption: 'A'
      }
    ])
  }

  getCalculatedMember(measure: string, type: PeriodFunctions): Property {
    console.log(measure, type)

    const property = {
      name: `${measure}_${type}`,
      role: AggregationRole.measure,
      formula: `xxxxxxxxxxxx`
    } as CalculatedProperty

    this.registerMeasure(property.name, property)

    return property
  }

  override getIndicator(id: string): Indicator {
    return this.dataSource.getIndicator(id, this.entitySet)
  }

  override onDestroy(): void {
    //
  }
}

export const dataSettings = {
  dataSource: 'Mock',
  entitySet: 'SalesOrder',
  chartAnnotation: {
    chartType: {
      type: 'Bar'
    },
    dimensions: [
      {
        dimension: 'Department'
      }
    ],
    measures: [
      {
        dimension: C_MEASURES,
        measure: 'sales'
      }
    ]
  }
}
