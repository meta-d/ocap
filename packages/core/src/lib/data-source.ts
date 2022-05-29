import { assign, flatten, isEqual, isNil, isString } from 'lodash'
import { BehaviorSubject, distinctUntilChanged, EMPTY, map, Observable, pluck, shareReplay, switchMap } from 'rxjs'
import { Agent, DSCacheService } from './agent'
import { EntityService } from './entity'
import {
  Catalog,
  Cube,
  EntitySet,
  EntityType,
  IDimensionMember,
  Indicator,
  mergeEntityType,
  mergeEntityTypeCube,
  Schema,
  SemanticModel
} from './models'
import { Type } from './utils/index'

// export const DATA_SOURCE_PROVIDERS = {} as Record<string,{ factory: DataSourceFactory }>
export type DataSourceFactory = () => Promise<Type<DataSource>>

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

/**
 * 数据源配置项
 * 其实对应一个语义模型而不是一个数据源
 *
 * @TODO 需要使用 CSDL 的概念进行重新定义
 * * entityTypes 配置此数据源下多个 entity
 *    * entityType 每个 entity 的类型字段配置
 *    * annotations 每个 entity 的 annotations 配置
 */
export interface DataSourceOptions extends SemanticModel {
  /**
   * @TODO 语义模型 catalog 与原始 SQL 数据库的 catalog 冲突, 需要分开
   */
  catalog?: string
  settings?: DataSourceSettings
  authMethod?: string
  useLocalAgent?: boolean
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
   * 获取数据源的数据服务目录, 数据服务目录用于区分不同的数据实体类别, 如 ODataService 的 Catalog, XMLA 的 CATALOG_NAME 等
   */
  getCatalogs(): Observable<Array<Catalog>>

  /**
   * 获取所有的 EntitySet
   */
  getEntitySets(): Observable<Array<EntitySet>>

  /**
   * 获取运行时 EntityType
   */
  getEntityType(entitySet: string): Observable<EntityType>

  /**
   * 获取维度成员
   * 
   * @param entity 实体
   * @param dimension 维度
   */
  getMembers(entity: string, dimension: string): Observable<IDimensionMember[]>

  /**
   * 根据指定的 entitySet 名称创建相应的 entityService
   */
  createEntityService<T>(entitySet: string): EntityService<T>

  /**
   * 监听运行时 EDM Schema 配置变化
   */
  selectSchema(): Observable<Schema>

  /**
   * 设置自定义的 Schema
   *
   * @param schema EDMSchema
   */
  setSchema(schema: Schema): void

  /**
   * 更新单个 Cube 定义
   *
   * @param cube
   */
  updateCube(cube: Cube): void

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
   * 订阅 Entity 的类型定义变化，合并运行时和用户增强后的
   *
   * @param entity
   */
  selectEntityType(entity: string): Observable<EntityType>

  /**
   * 获取实体相关指标
   *
   * @param entitySet 实体
   */
  selectIndicators(entitySet: string): Observable<Array<Indicator>>

  /**
   * 获取指定指标
   *
   * @param id 指标 ID
   * @param entity
   */
  getIndicator(id: string, entity?: string): Indicator

  /**
   * 创建表
   *
   * @param name
   * @param columns
   * @param data
   */
  createEntity(name, columns, data?): Observable<string>

  /**
   * 使用语句查询
   *
   * @param statement
   */
  query(options: { statement: string }): Observable<any>

  /**
   * 清除浏览器端缓存
   */
  clearCache(): Promise<void>
}

/**
 * 数据源模型的通用功能实现, 包含元数据的获取, 执行一些与具体模型 Entity 无关的操作查询, 创建 Entity Service 等
 *
 */
export abstract class AbstractDataSource<T extends DataSourceOptions> implements DataSource {
  private options$ = new BehaviorSubject<T>(null)
  get options() {
    return this.options$.value
  }

  protected _entitySets = {}
  // private _entityTypies = {}
  constructor(options: T, public agent: Agent, protected cacheService: DSCacheService) {
    this.options$.next(options)
  }

  abstract createEntityService<T>(entitySet: string): EntityService<T>
  abstract getEntitySets(): Observable<Array<EntitySet>>
  abstract getEntityType(entitySet: string): Observable<EntityType>
  abstract getCatalogs(): Observable<Array<Catalog>>
  abstract getMembers(entity: string, dimension: string): Observable<IDimensionMember[]>
  abstract createEntity(name, columns, data?): Observable<string>
  abstract query({ statement: string }): Observable<any>

  setSchema(schema: Schema): void {
    this.options$.next({ ...this.options$.value, schema })
  }

  updateCube(cube: Cube) {
    const schema = this.options.schema ?? {} as Schema
    const cubes = schema.cubes ? [...schema.cubes] : []
    const index = cubes.findIndex((item) => item.__id__ === cube.__id__)
    if (index > -1) {
      cubes.splice(index, 1, cube)
    } else {
      cubes.push(cube)
    }

    this.options$.next({
      ...this.options$.value,
      schema: {
        ...schema,
        cubes
      }
    })
  }

  selectSchema(): Observable<Schema> {
    return this.options$.pipe(
      distinctUntilChanged(),
      map((options) => options?.schema),
      distinctUntilChanged(isEqual)
    )
  }

  setEntityType(entityType: EntityType) {
    const schema = this.options.schema ?? ({} as Schema)

    const entitySets = schema.entitySets ?? {}
    entitySets[entityType.name] = entitySets[entityType.name] ?? {name: entityType.name} as EntitySet
    entitySets[entityType.name].entityType = entityType

    this.options$.next({
      ...this.options,
      schema: {
        ...schema,
        entitySets
      }
    })
  }

  selectEntitySet(entity: string): Observable<EntitySet> {
    if (!this._entitySets[entity]) {
      this._entitySets[entity] = this.getEntityType(entity).pipe(
        switchMap((rtEntityType) =>
          this.selectSchema().pipe(
            // map((schema) => schema?.entities?.find((item) => item.name === entity)),
            distinctUntilChanged(),
            map((schema) => {
              const customEntityType = schema?.entitySets?.[entity]?.entityType
              const cube = schema?.cubes?.find((item) => item.name === entity)

              let entityType = mergeEntityTypeCube(rtEntityType, cube)

              if (!isNil(customEntityType)) {
                // TODO merge 函数有风险
                entityType = mergeEntityType(assign({}, entityType), {
                  ...customEntityType,
                  ...this._getCustomEntityType(customEntityType)
                })
              }

              console.log(`runtime entity type is:`, rtEntityType, `cube is:`, cube, `customEntityType:`, customEntityType, `merge cube:`, entityType)

              if (entityType) {
                // 将数据源方言同步到 EntityType
                entityType.dialect = this.options.dialect
                entityType.syntax = this.options.syntax
              }

              return {
                ...customEntityType,
                entityType
              }
            })
          )
        ),
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

  selectIndicators(entity: string): Observable<Indicator[]> {
    return this.selectEntitySet(entity).pipe(
      map((entitySet) => entitySet?.indicators),
      distinctUntilChanged()
    )
  }

  getIndicator(id: string, entity?: string): Indicator {
    if (this.options.schema?.entitySets) {
      const indicators = entity
        ? this.options.schema.entitySets?.[entity]?.indicators
        : flatten(Object.values(this.options.schema.entitySets).map((item) => item.indicators))
      return indicators?.find((indicator) => indicator.id === id || indicator.code === id)
    }
    return null
  }

  async clearCache(): Promise<void> {
    return await this.cacheService.clear('')
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
