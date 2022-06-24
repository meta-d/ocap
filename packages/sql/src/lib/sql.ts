import {
  AbstractDataSource,
  AggregationRole,
  Catalog,
  Dimension,
  EntityService,
  EntitySet,
  EntityType,
  IDimensionMember,
  QueryReturn
} from '@metad/ocap-core'
import isEqual from 'lodash/isEqual'
import { distinctUntilChanged, from, map, Observable, shareReplay, switchMap } from 'rxjs'
import { compileDimensionSchema, DimensionMembers } from './dimension'
import { SQLEntityService } from './entity.service'
import { serializeCubeFact } from './query'
import {
  C_MEASURES_ROW_COUNT,
  decideRole,
  serializeWrapCatalog,
  SQLDataSourceOptions,
  SQLQueryResult,
  SQLSchema
} from './types'

export class SQLDataSource extends AbstractDataSource<SQLDataSourceOptions> {
  private _catalogs$: Observable<Array<Catalog>>
  private _entitySets$: Observable<Array<EntitySet>>
  /**
   * 获取数据库表列表
   */
  getEntitySets(): Observable<EntitySet[]> {
    if (!this._entitySets$) {
      this._entitySets$ = from(this.fetchSchema(this.options.name, this.options.catalog || '')).pipe(
        map((tables: SQLSchema[]) => {
          return tables
            .filter((table) => (this.options.catalog ? table.database === this.options.catalog : true))
            .map((item) => {
              const tableName = this.options.catalog
                ? item.name
                : item.database
                ? `${item.database}.${item.name}`
                : item.name
              const entityType = mapTableSchemaEntityType(tableName, item)
              return {
                name: tableName,
                entityType
              }
            }) as EntitySet[]
        }),
        shareReplay(1)
      )
    }

    return this._entitySets$
  }

  async fetchSchema(modelName: string, catalog: string): Promise<Array<SQLSchema>> {
    return this.agent
      .request(this.options, {
        method: 'get',
        url: 'schema',
        catalog
      })
      .then((data) => data?.filter((table) => (catalog ? table.database === catalog : true)))
      .catch((error) => {
        console.error(error)
        return []
      })
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
            return {
              type: 'CUBE',
              cube
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
        switchMap(async ({ type, cube, dimension }) => {
          if (dimension) {
            // Schema dimension to EntityType
            const rtDimension = compileDimensionSchema(entity, dimension)
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

          try {
            let schemas
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

            if (!schemas?.length) {
              this.agent.error(`未能获取到 Entity '${entity}' 的运行时元数据`)
              return null
            }

            const _entityType = mapTableSchemaEntityType(entity, schemas[0])
            return _entityType
          } catch (error: any) {
            this.agent.error(error.message)
            console.error(error.message)
            return null
          }
        }),
        shareReplay(1)
      )
  }

  /**
   * 应该对应数据库的什么对象 ?
   */
  getCatalogs(): Observable<Catalog[]> {
    if (!this._catalogs$) {
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
   * @param entity
   * @param dimension
   * @returns
   */
  getMembers(entity: string, dimension: Dimension): Observable<IDimensionMember[]> {
    return this.getEntityType(entity).pipe(
      switchMap((entityType) => {
        return this.query({
          statement: DimensionMembers(dimension, entityType, this.options.schema, this.options.dialect)
        }).pipe(
          map((result) => {
            // console.log(entity, dimension, result)
            return result.data.map((item) => ({
              ...dimension,
              memberKey: item[dimension.dimension],
              memberCaption: item[dimension.caption],
              entity
            })) as IDimensionMember[]
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

function mapTableSchemaEntityType(entity: string, item: SQLSchema) {
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
