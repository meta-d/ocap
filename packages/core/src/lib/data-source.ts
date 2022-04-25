import { assign, isEqual, isNil, isString } from 'lodash'
import { BehaviorSubject, distinctUntilChanged, EMPTY, map, Observable, pluck, shareReplay, switchMap } from 'rxjs'
import { Agent, AgentType } from './agent'
import { Catalog, EDMSchema, EntitySet, EntityType, IDimensionMember, mergeEntityType } from './csdl/index'
import { EntityService } from './ds-core.service'
import { SDL } from './models'
import { Syntax } from './types'

export const DATA_SOURCE_PROVIDERS = {} as Record<
  string,
  { factory: (options: DataSourceOptions, agent: Agent) => DataSource }
>

export type DataSourceType =
  | 'OData'
  | 'ODataAnnotation'
  | 'GraphQL'
  | 'JSON'
  | 'XML'
  | 'RAW'
  | 'XMLA'
  | 'SQL'
  | 'SQLite'
  | 'Mock'

export enum AuthenticationMethod {
  none = 'none',
  basic = 'basic',
  saml = 'saml',
  independent = 'independent'
}

/**
 * 与数据源类型相关的属性设置
 */
export interface DataSourceSettings {
  dataSourceId?: string
  // modelId?: string
  // catalog
  database?: string
  // 语言
  language?: string
}

export interface DataSources {
  [name: string]: DataSourceOptions
}

export interface ConnectionOptions extends Record<string, unknown> {
  secure: boolean
  protocol?: string
  host?: string
  port?: number
  path: string
  authMethod?: AuthenticationMethod
  username?: string
  password?: string
  [key: string]: any
}

/**
 * 数据源配置项
 * 其实对应一个语义模型而不是一个数据源
 *
 * @TODO 需要使用 CSDL 的概念进行重新定义
 * * entityTypes 配置此数据源下多个 entity
 *    * entityType 每个 entity 的类型字段配置
 *    * annotations 每个 entity 的 annotations 配置
 */
export interface DataSourceOptions {
  name?: string
  type: DataSourceType
  catalog?: string
  agentType: AgentType
  settings?: DataSourceSettings
  /**
   * 数据查询所使用的语言
   */
  syntax?: Syntax
  /**
   * 数据源内的方言, 如 OData 中有 SAP, Microsoft 等, XMLA 中有 SAP BW, SQL 数据库有 Postgres Mysql Hive 等
   */
  dialect?: string
  schema?: SDL.Schema
}

/**
 * 数据源的抽象接口
 * * options 配置项
 * * createEntityService 创建 entityService
 * * getAnnotation 获取 annotation
 */
export interface DataSource {
  options: DataSourceOptions
  agent: Agent

  /**
   * 根据指定的 entitySet 名称创建相应的 entityService
   */
  createEntityService<T>(entitySet: string): EntityService<T>

  /**
   * 获取所有的 EntitySet
   */
  getEntitySets(): Observable<Array<EntitySet>>

  /**
   * 获取运行时 EntityType
   */
  getEntityType(entitySet: string): Observable<EntityType>

  /**
   * 获取数据源的数据服务目录, 数据服务目录用于区分不同的数据实体类别, 如 ODataService 的 Catalog, XMLA 的 CATALOG_NAME 等
   */
  getCatalogs(): Observable<Array<Catalog>>

  getMembers(entity: string, dimension: string): Observable<IDimensionMember[]>

  /**
   * 监听运行时 EDM Schema 配置变化
   */
  selectSchema(): Observable<EDMSchema>

  /**
   * 设置自定义的 Schema
   *
   * @param schema EDMSchema
   */
  setSchema(schema: EDMSchema): void

  /**
   * 订阅 Entity 的类型定义变化， 合并运行时和用户增强后的
   *
   * @param entity
   */
  selectEntitySet(entity: string): Observable<EntitySet>

  /**
   * 单独设置一个 EntityType
   *
   * @param entityType EntityType
   */
  setEntityType(entityType: EntityType): void

  /**
   * 订阅 Entity 的类型定义变化， 合并运行时和用户增强后的
   *
   * @param entity
   */
  selectEntityType(entity: string): Observable<EntityType>

  /**
   * 创建表
   *
   * @param name
   * @param columns
   * @param data
   */
  createEntity(name, columns, data?): Observable<string>
}

export abstract class AbstractDataSource<T extends DataSourceOptions> implements DataSource {
  private options$ = new BehaviorSubject<T>(null)
  get options() {
    return this.options$.value
  }

  private _entitySets = {}
  private _entityTypies = {}
  constructor(options: T, public agent: Agent) {
    this.options$.next(options)
  }

  abstract createEntityService<T>(entitySet: string): EntityService<T>
  abstract getEntitySets(): Observable<Array<EntitySet>>
  abstract getEntityType(entitySet: string): Observable<EntityType>
  abstract getCatalogs(): Observable<Array<Catalog>>
  abstract getMembers(entity: string, dimension: string): Observable<IDimensionMember[]>
  abstract createEntity(name, columns, data?): Observable<string>

  setSchema(schema: EDMSchema): void {
    this.options$.next({ ...this.options$.value, schema })
  }

  selectSchema(): Observable<EDMSchema> {
    return this.options$.pipe(
      distinctUntilChanged(),
      map((options) => options?.schema),
      distinctUntilChanged(isEqual)
    )
  }

  setEntityType(entityType: EntityType) {
    const options = this.options$.value
    const entitySet = options.schema?.entitySets?.[entityType.name] || {}
    this.options$.next({
      ...options,
      schema: {
        ...options.schema,
        entitySets: {
          ...options.schema.entitySets,
          [entityType.name]: {
            ...entitySet,
            entityType
          }
        }
      }
    })
  }

  selectEntitySet(entity: string): Observable<EntitySet> {
    if (!this._entitySets[entity]) {
      this._entitySets[entity] = this.getEntityType(entity).pipe(
        switchMap((rtEntityType) =>
          this.selectSchema().pipe(
            map((schema) => schema?.entitySets?.[entity] ?? { entityType: null }),
            distinctUntilChanged(),
            map((customEntitySet) => {
              let entityType = rtEntityType
              if (!isNil(customEntitySet)) {
                // TODO merge 函数有风险
                entityType = mergeEntityType(assign({}, rtEntityType), {
                  ...customEntitySet?.entityType,
                  ...this._getCustomEntityType(customEntitySet?.entityType)
                })
              }
              if (entityType) {
                // 将数据源方言同步到 EntityType
                entityType.dialect = this.options.dialect
                entityType.syntax = this.options.syntax
              }

              return {
                ...customEntitySet,
                entityType
              }
            })
          )
        ),
        // catchError((err) => {
        //   // TODO 1. 如何处理错误
        //   // 2. 错误是否会中断处理链
        //   console.error(err)
        //   return of({} as any)
        // }),
        shareReplay(1)
      )
    }
    return this._entitySets[entity]
  }

  selectEntityType(entity: string): Observable<EntityType> {
    if (!entity) {
      return EMPTY
    }
    return this.selectEntitySet(entity).pipe(pluck('entityType'))
  }

  /**
   * 获取自定义 entityType, 用户在程序里自定义的 entityType 属性非数据源端的 entityType
   */
  protected _getCustomEntityType(entityType: EntityType): Partial<EntityType> {
    if (!entityType?.properties) {
      return {} as EntityType
    }
    const properties = {}
    Object.entries(entityType.properties).forEach(([key, value]) => {
      if (isNil(value.name)) {
        value.name = key
      }
      if (value.text) {
        if (isString(value.text)) {
          value.text = entityType.properties[value.text] || value.text
        } else {
          properties[value.text.name] = value.text
        }
      }
      if (value.unit) {
        if (isString(value.unit)) {
          value.unit = entityType.properties[value.unit] || value.unit
        } else {
          properties[value.unit.name] = value.unit
        }
      }

      properties[key] = value
    })
    return {
      properties
    }
  }
}
