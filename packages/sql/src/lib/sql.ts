import {
  AbstractDataSource,
  Agent,
  AggregationRole,
  Catalog,
  DATA_SOURCE_PROVIDERS,
  EntityService,
  EntitySet,
  EntityType,
  IDimensionMember
} from '@metad/ocap-core'
import { isEmpty } from 'lodash'
import { catchError, distinctUntilChanged, map, Observable, of, switchMap, throwError } from 'rxjs'
import { SQLEntityService } from './entity.service'
import { getFirstElement, serializeFrom } from './query'
import { decideRole, SQLDataSourceOptions, SQLSchema } from './types'
import { typeOfObj } from './utils'

DATA_SOURCE_PROVIDERS['SQL'] = {
  factory: (options: SQLDataSourceOptions, agent: Agent) => {
    return new SQLDataSource(options, agent)
  }
}

export class SQLDataSource extends AbstractDataSource<SQLDataSourceOptions> {
  getEntitySets(): Observable<EntitySet[]> {
    throw new Error('Method not implemented.')
  }

  fetchTableSchema(modelName: string, catalog: string, table: string): Promise<SQLSchema> {
    return this.agent
      .request(this.options, {
        method: 'get',
        url: 'schema',
        catalog,
        table
      })
      // .then((data) => data?.[0])
      .catch(error => {
        console.error(error)
        return []
      })
  }

  getEntityType(entitySet: any): Observable<EntityType> {
    return this.selectSchema().pipe(
      map((schema) => schema?.entitySets?.[entitySet]?.entityType),
      distinctUntilChanged(),
      switchMap(async (entityType) => {
        // entityType 来自于用户自定义的元数据配置
        // 如果 entityType 为 null, 则 entitySet 为运行时指定的表名, 直接取 entitySet 相应的运行时元数据
        const table = entityType?.table || entitySet // || getFirstElement<MDX.Table>(entityType?.cube?.Table)?.name || entitySet
        if (entityType?.expression) {
          
          const result = await this.agent.request(this.options, {
            method: 'post',
            url: 'query',
            body: this.describe(entityType, this.options.dialect),
            catalog: this.options.catalog
          })

          if (result) {
            const { data, columns = [], error } = result
            if (isEmpty(columns) && data?.[0]) {
              columns.push(...typeOfObj(data[0]).map((col) => ({
                ...col,
                aggregationRole: col.type === 'number' ? AggregationRole.measure : AggregationRole.dimension,
                dataType: col.type,
              })))
            }

            console.warn(`sql entityType columns:`, columns)

            const properties = {}
            columns?.forEach((column) => {
              properties[column.name] = {
                ...column,
                __id__: column.name,
                aggregationRole: column.aggregationRole || decideRole(column.type),
                dataType: column.type,
              }
            })

            return {
              name: entitySet,
              properties
            }
          }
          return null
        } else {
          const schema = await this.fetchTableSchema(this.options.name, this.options.catalog || '', table)
          if (!schema) {
            // this.agent.error(`未能获取到 Entity '${entitySet}' 的运行时元数据`)
            return null
          }
          const _entityType = mapTableSchemaEntityType(schema)
          return {
            ..._entityType,
            name: entitySet
          }
        }
      }),
      catchError(err => {
        // this.agent.error(err)
        return throwError(() => new Error(err))
      })
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

  describe(entityType, dialect) {
    return `SELECT * FROM ${serializeFrom(entityType, dialect)} LIMIT 1`
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
      __id__: column.name,
      name: column.name,
      label: column.label,
      dataType: column.type,
      // 从后端进行推荐角色, 因为不同数据库字段类型差别很大
      // 似乎后端判断也不合适
      aggregationRole: column.aggregationRole || decideRole(column.type)
    }
  })
  return entityType
}