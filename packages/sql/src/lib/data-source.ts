import {
  AbstractDataSource,
  AggregationRole,
  Catalog,
  DBCatalog,
  DBTable,
  Dimension,
  EntityService,
  EntitySet,
  EntityType,
  IDimensionMember,
  MDCube,
  QueryReturn
} from '@metad/ocap-core'
import isEqual from 'lodash/isEqual'
import { combineLatest, distinctUntilChanged, from, map, Observable, shareReplay, switchMap } from 'rxjs'
import { compileCubeSchema } from './cube'
import { compileDimensionSchema, DimensionMembers } from './dimension'
import { SQLEntityService } from './entity.service'
import { serializeCubeFact } from './query'
import {
  C_MEASURES_ROW_COUNT,
  SQLDataSourceOptions,
  SQLQueryResult,
  SQLSchema,
  SQLTableSchema
} from './types'
import {
  decideRole,
  isCaseInsensitive,
  serializeWrapCatalog,
} from './utils'

export class SQLDataSource extends AbstractDataSource<SQLDataSourceOptions> {
  private _catalogs$: Observable<Array<Catalog>>
  private _entitySets$: Observable<Array<EntitySet>>

  discoverDBCatalogs(): Observable<DBCatalog[]> {
    return from(
      this.agent
        .request(this.options, { method: 'get', url: 'catalogs' })
        // TODO ???
        .catch((error) => {
          console.error(error)
          return []
        })
    )
  }

  discoverDBTables(): Observable<DBTable[]> {
    return from(this.fetchSchema(this.options.name, this.options.catalog || '')).pipe(
      map((schemas: SQLSchema[]) => {
        const entitySets = []
        schemas
          // 过滤出当前 Catalog (对应三段式中的 schema, 后续改成 schema) 的 tables , 因为有些 DB Driver 会带出来所有 catalog 下的 tables
          // .filter((schema) => (this.options.catalog ? schema.schema === this.options.catalog : true))
          .forEach((schema) => {
            schema.tables.forEach((table) => {
              entitySets.push({
                catalog: schema.schema,
                name: table.name,
                label: table.label
              })
            })
          })
        return entitySets
      })
    )
  }

  discoverMDCubes(): Observable<MDCube[]> {
    return this.selectSchema().pipe(
      map((schema) => {
        return schema?.cubes?.map((cube) => {
          return {
            name: cube.name,
            label: cube.label,
            entityType: null
          }
        })
      }),
      distinctUntilChanged(isEqual)
    )
  }

  discoverMDMembers(entity: string, dimension: Dimension) {
    return this.getMembers(entity, dimension)
  }

  /**
   * @deprecated use discoverDBCatalogs
   *
   * 应该对应数据库的什么对象 ?
   */
  getCatalogs(refresh?: boolean): Observable<Catalog[]> {
    if (!this._catalogs$ || refresh) {
      this._catalogs$ = from(
        this.agent
          .request(this.options, { method: 'get', url: 'catalogs' })
          // TODO ???
          .catch((error) => {
            console.error(error)
            return []
          })
      )
    }
    return this._catalogs$
  }

  /**
   * 获取数据库表列表
   *
   * @TODO 应不应该用缓存, 用了缓存刷新怎么做? refresh ?
   *
   */
  getEntitySets(refresh?: boolean): Observable<EntitySet[]> {
    if (!this._entitySets$ || refresh) {
      this._entitySets$ = from(this.fetchSchema(this.options.name, this.options.catalog || '')).pipe(
        map((schemas: SQLSchema[]) => {
          const entitySets = []
          schemas
            // 过滤出当前 Catalog (对应三段式中的 schema, 后续改成 schema) 的 tables , 因为有些 DB Driver 会带出来所有 catalog 下的 tables
            .filter((schema) => (this.options.catalog ? schema.schema === this.options.catalog : true))
            .forEach((schema) => {
              schema.tables.forEach((table) => {
                // 感觉这里应该只用到了 table label
                // const entityType = mapTableSchemaEntityType(table.name, table)
                entitySets.push({
                  catalog: schema.schema,
                  name: table.name,
                  label: table.label
                  // entityType
                })
              })
            })
          return entitySets
        }),
        shareReplay(1)
      )
    }

    return this._entitySets$
  }

  async fetchSchema(modelName: string, catalog: string): Promise<Array<SQLSchema>> {
    return (
      this.agent
        .request(this.options, {
          method: 'get',
          url: 'schema',
          catalog
        })
        // .then((data) => data?.filter((table) => (catalog ? table.database === catalog : true)))
        .catch((error) => {
          console.error(error)
          return []
        })
    )
  }

  async fetchTableSchema(modelName: string, catalog: string, table: string, statement?: string): Promise<SQLSchema[]> {
    return this.agent.request(this.options, {
      method: 'get',
      url: 'schema',
      catalog,
      table,
      statement
    })
  }

  /**
   * 从数据源获取实体的类型
   *
   * @param entity
   * @returns
   */
  getEntityType(entity: string): Observable<EntityType> {
    return this.selectSchema()
      .pipe(
        map((schema) => {
          // Find schema defination for the entity
          const cube = schema?.cubes?.find((item) => item.name === entity)
          if (cube) {
            const dimensions = cube.dimensionUsages?.map((usage) => {
              const dimension = schema.dimensions.find((item) => item.name === usage.source)
              if (!dimension) {
                throw new Error(`未找到源维度'${usage.source}'`)
              }
              return dimension
            })
            return {
              type: 'CUBE',
              cube,
              dimensions
            }
          }
          const dimension = schema?.dimensions?.find((item) => item.name === entity)
          if (dimension) {
            return {
              type: 'DIMENSION',
              dimension
            }
          }
          return {}
        }),
        distinctUntilChanged(isEqual)
      )
      .pipe(
        switchMap(async ({ type, cube, dimension, dimensions }) => {
          if (dimension) {
            // Schema dimension to EntityType
            const rtDimension = compileDimensionSchema(entity, dimension, this.options.dialect)
            return {
              name: entity,
              properties: {
                [rtDimension.name]: rtDimension,
                [C_MEASURES_ROW_COUNT]: {
                  name: C_MEASURES_ROW_COUNT,
                  role: AggregationRole.measure,
                  entity
                }
              }
            } as EntityType
          }

          if (cube) {
            return compileCubeSchema(entity, cube, dimensions, this.options.dialect)
          }

          try {
            let schemas: SQLSchema[]
            if (entity && !cube) {
              schemas = await this.fetchTableSchema(this.options.name, this.options.catalog || '', entity)
            } else if (cube) {
              // 如果 entityType 为 null, 则 entitySet 为运行时指定的表名, 直接取 entitySet 相应的运行时元数据
              const statement =
                cube.expression || (cube.tables?.length ? serializeCubeFact(cube, this.options.dialect) : null)
              if (!statement) {
                return null
              }
              schemas = await this.fetchTableSchema(this.options.name, this.options.catalog || '', null, statement)
            }

            if (!schemas[0]?.tables?.[0]) {
              console.log(schemas)
              throw new Error(`未能获取到实体 '${entity}' 的运行时元数据`)
            }

            const _entityType = mapTableSchemaEntityType(entity, schemas[0]?.tables?.[0])
            return _entityType
          } catch (err: any) {
            let error: string
            if (typeof err === 'string') {
              error = err
            } else if (err instanceof Error) {
              error = err?.message
            } else if (err?.error instanceof Error) {
              error = err?.error?.message
            } else {
              error = err
            }

            console.error(error)
            this.agent.error(error)
            return null
          }
        }),
        shareReplay(1)
      )
  }

  /**
   * @param entity
   * @param dimension
   * @returns
   */
  getMembers(entity: string, dimension: Dimension): Observable<IDimensionMember[]> {
    return this.getEntityType(entity).pipe(
      switchMap((entityType) => {
        return combineLatest(
          DimensionMembers(
            entity,
            dimension,
            entityType,
            this.options.schema,
            this.options.dialect,
            this.options.catalog
          ).map((statement) =>
            this.query({
              statement
            })
          )
        ).pipe(
          map((memberLevels) => {
            const members = []

            console.log(entity, dimension, memberLevels)

            memberLevels.forEach((level) => {
              members.push(
                ...level.data.map((item: any) =>
                  isCaseInsensitive(this.options.dialect)
                    ? {
                        ...item,
                        ...dimension,
                        memberKey: item.memberkey,
                        memberCaption: item.membercaption,
                        parentKey: item.parentkey,
                        entity
                      }
                    : {
                        ...item,
                        ...dimension,
                        entity
                      }
                )
              )
            })

            return members as IDimensionMember[]
          })
        )
      })
    )
  }

  createEntity(name: any, columns: any, data?: any): Observable<string> {
    throw new Error('Method not implemented.')
  }

  createEntityService<T>(entity: string): EntityService<T> {
    return new SQLEntityService(this, entity)
  }

  query(q: { statement: string }): Observable<QueryReturn<unknown>> {
    const statement = serializeWrapCatalog(q.statement, this.options.dialect, this.options.catalog)
    return from(
      this.agent.request(this.options, {
        method: 'post',
        url: 'query',
        body: { statement },
        catalog: this.options.catalog
      })
    ).pipe(
      map((result: SQLQueryResult) => ({
        ...result,
        data: result.data,
        schema: {
          columns: result.columns
        }
      }))
    )
  }
}

function mapTableSchemaEntityType(entity: string, item: SQLTableSchema) {
  const entityType = {
    name: entity,
    label: item.label,
    properties: {}
  } as EntityType
  item.columns?.forEach((column) => {
    entityType.properties[column.name] = {
      entity,
      dimension: column.name,
      __id__: column.name,
      name: column.name,
      label: column.label,
      dataType: column.type,
      // 从后端进行推荐角色, 因为不同数据库字段类型差别很大
      // 似乎后端判断也不合适
      role: decideRole(column.type)
    }
  })
  return entityType
}
