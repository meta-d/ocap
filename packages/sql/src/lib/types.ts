import { AggregationRole, DataSourceOptions, DataSourceSettings, Dimension, Property } from "@metad/ocap-core"

export interface SQLDataSourceOptions extends DataSourceOptions {
  settings?: SQLDataSourceSettings
}
export interface SQLDataSourceSettings extends DataSourceSettings {
  id?: string
  database?: string
}

export interface SQLSchema {
  database: string
  name: string
  label?: string
  columns: {
    name: string
    label?: string
    type: string
    // role?: AggregationRole
  }[]
}

export function decideRole(type: string) {
  switch(type) {
    case 'string':
      return AggregationRole.dimension
    case 'number':
      return AggregationRole.measure
    default:
      return AggregationRole.dimension
  }
}

// export enum ExecutionStatus {
//   UNKOWN,
//   WAITING,
//   PROCESSING,
//   DONE,
//   FAILED,
// }

// export interface Job {
//   status: ExecutionStatus
//   query_result_id: number
//   result: any
//   error?: any
// }

/**
 * TODO 不同的数据库需要拼出不同的字段名格式 ? 有没有最佳实践 ?
 * 
 * @param name 
 * @param dialect 
 * @returns 
 */
 export function serializeName(name: string, dialect: string) {
  if (['hive', 'presto'].includes(dialect)) {
    return name
  } else if (['mysql'].includes(dialect)) {
    return `\`${name}\``
  }

  return `"${name}"`
}

export function serializeWrapCatalog(expression: string, dialect: string, catalog: string) {
  if (['pg'].includes(dialect)) {
    return `SET search_path TO ${catalog};${expression}`
  }
  return expression
}

export interface SQLQueryContext {
  rows: Array<SQLQueryProperty>
  columns: Array<SQLQueryProperty>
  select: string[]
  where: string[]
  groupbys
  unbookedData: string[]
  zeroSuppression: boolean
  dialect: string
}

export interface SQLQueryProperty {
  dimension: Dimension
  property: Property
}