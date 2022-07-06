import { AggregationRole, DataSourceOptions, DataSourceSettings, Dimension, Measure, Property } from '@metad/ocap-core'

// 固有度量字段 行计数
export const C_MEASURES_ROW_COUNT = 'Measures_Row_Count'
export const C_MEMBER_CAPTION = 'MEMBER_CAPTION'

export interface SQLDataSourceOptions extends DataSourceOptions {
  settings?: SQLDataSourceSettings
}
export interface SQLDataSourceSettings extends DataSourceSettings {
  id?: string
  database?: string
}

/**
 * Database original schema
 * 
 * 三段式数据库命名 catalog.schema.table
 */
export interface SQLSchema {
  catalog?: string
  schema?: string
  tables?: SQLTableSchema[]
}

export interface SQLTableSchema {
  name: string
  label?: string
  columns: IColumnDef[]
}

export function decideRole(type: string) {
  switch (type) {
    case 'string':
      return AggregationRole.dimension
    case 'number':
      return AggregationRole.measure
    default:
      return AggregationRole.dimension
  }
}

/**
 * TODO 不同的数据库需要拼出不同的字段名格式 ? 有没有最佳实践 ?
 *
 * @param name
 * @param dialect
 * @returns
 */
export function serializeName(name: string, dialect: string, catalog?: string) {
  if (['pg', 'trino', 'presto', 'duckdb', 'hana'].includes(dialect)) {
    return `"${name}"`
  }

  if (['hive'].includes(dialect) && catalog) {
    return `\`${catalog}\`.\`${name}\``
  }

  return `\`${name}\``
}

export function serializeWrapCatalog(expression: string, dialect: string, catalog: string) {
  if (['pg'].includes(dialect) && catalog) {
    return `SET search_path TO ${catalog};${expression}`
  }
  return expression
}

export function serializeUniqueName(dialect: string, dimension: string, hierarchy?: string, level?: string, intrinsic?: string) {
  const separator = ['hive'].includes(dialect) ? '|' : '.'
  const connector = ['hive'].includes(dialect) ? '' : '.'
  let name = !!hierarchy && dimension !== hierarchy ? `[${dimension}${separator}${hierarchy}]` : `[${dimension}]`

  if (intrinsic) {
    name = `${name}${connector}[${level}]${connector}[${intrinsic}]`
  } else if (level) {
    name = `${name}${connector}[${level}]`
  }

  if (isCaseInsensitive(dialect)) {
    name = name.toLowerCase()
  }

  return name
}

export function serializeIntrinsicName(dialect: string, base: string, intrinsic: string) {
  const connector = ['hive'].includes(dialect) ? '' : '.'
  let name = `${base}${connector}[${intrinsic}]`

  if (isCaseInsensitive(dialect)) {
    name = name.toLowerCase()
  }

  return name
}

export function serializeMeasureName(dialect: string, measure: string) {
  if (isCaseInsensitive(dialect)) {
    measure = measure.toLowerCase()
  }

  return measure
}

export function isCaseInsensitive(dialect: string) {
  return ['hive'].includes(dialect)
}

export interface SQLQueryContext {
  rows: Array<SQLQueryProperty>
  columns: Array<SQLQueryProperty>
  select?: string[]
  where?: string[]
  groupbys?: string[]
  unbookedData?: string[]
  zeroSuppression?: boolean
  dialect?: string
}

export interface SQLQueryProperty {
  dimension: Dimension | Measure
  property: Property
}

// Types for sql database exec

export interface IColumnDef {
  name: string
  label?: string
  type: string
  dbType?: string
  nullable?: boolean
  position?: number
  /**
   * 应该等同于 label
   */
  comment?: string
}

export interface SQLQueryResult {
  status: 'OK' | 'ERROR'
  data?: Array<unknown>
  columns?: Array<IColumnDef>
  stats?: any
  error?: string
}
