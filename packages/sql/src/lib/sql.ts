import {
  AbstractDataSource,
  Catalog,
  EntityService,
  EntitySet,
  EntityType,
  IDimensionMember,
  QueryReturn
} from '@metad/ocap-core'
import {
  combineLatest,
  distinctUntilChanged,
  from,
  map,
  Observable,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs'
import { SQLEntityService } from './entity.service'
import { serializeCubeFact, serializeFrom } from './query'
import { decideRole, serializeWrapCatalog, SQLDataSourceOptions, SQLSchema } from './types'


export class SQLDataSource extends AbstractDataSource<SQLDataSourceOptions> {
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
              const entityType = mapTableSchemaEntityType(item)
              return {
                name: tableName,
                entityType: {
                  ...entityType,
                  name: tableName
                }
              }
            }) as EntitySet[]
        }),
        shareReplay(1)
      )
    }

    return this._entitySets$
  }

  fetchSchema(modelName: string, catalog: string): Promise<Array<SQLSchema>> {
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

  async fetchTableSchema(modelName: string, catalog: string, table: string, statement: string): Promise<SQLSchema[]> {
    return (
      this.agent
        .request(this.options, {
          method: 'get',
          url: 'schema',
          catalog,
          table,
          statement,
        })
    )
  }

  /**
   * 从数据源获取实体的类型
   *
   * @param entitySet
   * @returns
   */
  getEntityType(entity: any): Observable<EntityType> {
    return combineLatest([
      this.selectSchema().pipe(
        map((schema) => schema?.entitySets?.[entity]),
        distinctUntilChanged()
      ),
      this.selectSchema().pipe(
        map((schema) => schema?.cubes?.find((item) => item.name === entity)),
        distinctUntilChanged()
      )
    ]).pipe(
      switchMap(async ([entitySet, cube]) => {
        // if (!cube?.tables?.length) {
        //   return null
        // }

        // entityType 来自于用户自定义的元数据配置
        // 如果 entityType 为 null, 则 entitySet 为运行时指定的表名, 直接取 entitySet 相应的运行时元数据
        const statement = cube?.expression || (cube?.tables?.length ? serializeCubeFact(cube) : null)
        // // const table = cube?.tables?.[0]?.name || entitySet
        // if (entityType?.expression) {
        //   const result = await this.agent.request(this.options, {
        //     method: 'post',
        //     url: 'query',
        //     // body: this.describe(entityType, this.options.dialect),
        //     catalog: this.options.catalog
        //   })

        //   if (result) {
        //     const { data, columns = [], error } = result
        //     if (isEmpty(columns) && data?.[0]) {
        //       columns.push(
        //         ...typeOfObj(data[0]).map((col) => ({
        //           ...col,
        //           aggregationRole: col.type === 'number' ? AggregationRole.measure : AggregationRole.dimension,
        //           dataType: col.type
        //         }))
        //       )
        //     }

        //     console.warn(`sql entityType columns:`, columns)

        //     const properties = {}
        //     columns?.forEach((column) => {
        //       properties[column.name] = {
        //         ...column,
        //         __id__: column.name,
        //         aggregationRole: column.aggregationRole || decideRole(column.type),
        //         dataType: column.type
        //       }
        //     })

        //     return {
        //       name: entitySet,
        //       properties
        //     }
        //   }
        //   return null
        // } else {
          const schema = await this.fetchTableSchema(this.options.name, this.options.catalog || '', statement ? null : entity, statement)
          if (!schema?.length) {
            // this.agent.error(`未能获取到 Entity '${entitySet}' 的运行时元数据`)
            return null
          }
          const _entityType = mapTableSchemaEntityType(schema[0])

          console.log(`getEntityType from entityType`, entitySet?.entityType, `cube`, cube, `runtime type is`, _entityType)

          return {
            ..._entityType,
            name: entity
          }
        // }
      }),
      // catchError((err) => {
      //   console.log(`*************************** errorrrrrrrrrrrrrrrrrrrrr *************************************`)
      //   return throwError(() => new Error(err))
      // })
    )
  }

  getCatalogs(): Observable<Catalog[]> {
    throw new Error('Method not implemented.')
  }
  getMembers(entity: string, dimension: string): Observable<IDimensionMember[]> {
    throw new Error('Method not implemented.')
  }
  createEntity(name: any, columns: any, data?: any): Observable<string> {
    throw new Error('Method not implemented.')
  }
  createEntityService<T>(entitySet: string): EntityService<T> {
    return new SQLEntityService(this, entitySet)
  }

  // describe(entityType, dialect) {
  //   return `SELECT * FROM ${serializeFrom( entityType, dialect)} LIMIT 1`
  // }

  query(q: {statement: string}): Observable<QueryReturn<unknown>> {
    const statement = serializeWrapCatalog(
      q.statement,
      this.options.dialect,
      this.options.catalog
    )
    return from(
      this.agent.request(this.options, {
        method: 'post',
        url: 'query',
        body: {statement},
        catalog: this.options.catalog
      })
    ).pipe(
      map((result) => ({
        data: result.data,
        schema: {
          columns: result.columns
        }
      }))
    )
  }
}

function mapTableSchemaEntityType(item: SQLSchema) {
  const entityType = {
    name: item.name,
    label: item.label,
    properties: {}
  } as EntityType
  item.columns?.forEach((column) => {
    entityType.properties[column.name] = {
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
