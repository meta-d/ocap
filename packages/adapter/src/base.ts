import * as _axios from 'axios'
import { CreationTable, IColumnDef, IDSSchema, IDSTable } from './types'

const axios = _axios.default

export const QUERY_RUNNERS: Record<
  string,
  new (options?: AdapterBaseOptions, ...args: unknown[]) => DBQueryRunner
> = {}

export interface QueryResult {
  status: 'OK' | 'ERROR'
  data?: Array<unknown>
  columns?: Array<IColumnDef>
  stats?: any
  error?: string
}

export interface AdapterBaseOptions {
  host: string
  port: number
  username: string
  password: string
}

export interface QueryOptions {
  catalog: string
}

/**
 * Duties:
 * * 转换错误消息成为统一格式
 * * 连接不同类型的数据源
 */
export interface DBQueryRunner {
  type: string
  name: string
  syntax: string
  protocol: string
  host: string
  port: number | string
  jdbcDriver: string
  configurationSchema: Record<string, unknown>
  jdbcUrl(schema?: string): string
  /**
   * Execute a sql query
   * 
   * @param sql 
   */
  run(sql: string): Promise<any>
  /**
   * Execute a sql query with options
   * 
   * @param query 
   * @param options 
   */
  runQuery(query: string, options?: QueryOptions): Promise<unknown>
  /**
   * Get catalog (schema or database) list in data source
   */
  getCatalogs(): Promise<IDSSchema[]>
  /**
   * Get schema of table in catalog (schema or database)
   * 
   * @param catalog 
   * @param tableName 
   */
  getSchema(catalog?: string, tableName?: string): Promise<IDSTable[]>
  /**
   * Describe a sql query result schema
   * 
   * @param catalog 
   * @param statement 
   */
  describe(catalog: string, statement: string): Promise<{columns?: IDSTable['columns']}>
  /**
   * Ping the db
   */
  ping(): Promise<void>
  /**
   * Create or append table data
   * 
   * @param params 
   * @param options 
   */
  import(params: CreationTable, options?: QueryOptions): Promise<any>
  /**
   * Drop a table
   * 
   * @param name Table name
   * @param options 
   */
  dropTable(name: string, options?: QueryOptions): Promise<void>
  teardown(): void
}

export abstract class BaseQueryRunner<T extends AdapterBaseOptions = AdapterBaseOptions> implements DBQueryRunner {
  type: string
  name: string
  syntax: string
  protocol: string
  jdbcDriver: string
  abstract get host(): string
  abstract get port(): number | string
  options: T

  jdbcUrl(schema?: string) {
    return ''
  }
  get configurationSchema() {
    return null
  }

  constructor(options?: T) {
    this.options = options
  }

  run(sql: string): Promise<any> {
    return this.runQuery(sql)
  }

  abstract runQuery(query: string, options?: QueryOptions): Promise<QueryResult>
  abstract getCatalogs(): Promise<IDSSchema[]>
  abstract getSchema(catalog?: string, tableName?: string): Promise<IDSSchema[]>
  describe(catalog: string, statement: string): Promise<{columns?: IDSTable['columns']}> {
    throw new Error(`Unimplemented`)
  }
  abstract ping(): Promise<void>
  async import({name, columns, data}, options?: {catalog?: string}): Promise<void> {return null}
  async dropTable(name: string, options?: any): Promise<void> {
    this.runQuery(`DROP TABLE ${name}`, options)
  }
  abstract teardown(): void
}

export interface HttpAdapterOptions extends AdapterBaseOptions {
  url?: string
}

export abstract class BaseHTTPQueryRunner<T extends HttpAdapterOptions = HttpAdapterOptions> extends BaseQueryRunner<T> {
  get url(): string {
    return this.options?.url as string
  }
  get host() {
    if (this.options?.host) {
      return this.options.host as string
    }
    return new URL(this.options?.url as string).hostname
  }

  get port(): number | string {
    if (this.options?.port) {
      return Number(this.options.port)
    }
    return new URL(this.options?.url as string).port
  }

  get configurationSchema() {
    return {}
  }

  get() {
    return axios.get(this.url)
  }

  post(data, options?: any) {
    return axios.post(this.url, data, options)
  }

  abstract runQuery(query: string, options: any): Promise<any>
}

export interface SQLAdapterOptions extends AdapterBaseOptions {
  url?: string
  catalog?: string

  use_ssl?: boolean
  ssl_cacert?: string
  version?: number
}

export abstract class BaseSQLQueryRunner<T extends SQLAdapterOptions = SQLAdapterOptions> extends BaseQueryRunner<T> {
  syntax = 'sql'
  protocol = 'sql'

  get host() {
    if (this.options?.host) {
      return this.options.host as string
    }
    if (this.options?.url) {
      return new URL(this.options?.url as string).hostname
    }
    return null
  }

  get port() {
    if (this.options?.port) {
      return Number(this.options.port)
    }
    if (this.options?.url) {
      return new URL(this.options?.url as string).port
    }
    return null
  }

  async ping(): Promise<void> {
    await this.runQuery(`SELECT 1`)
  }
}

export function register(
  type: string,
  query_runner_class: new (options?: AdapterBaseOptions, ...args: unknown[]) => DBQueryRunner
) {
  if (QUERY_RUNNERS[type]) {
    throw new Error(`Type ${type} already existed!`)
  }
  QUERY_RUNNERS[type] = query_runner_class
}

export function createQueryRunnerByType(type: string, options: AdapterBaseOptions) {
  if (QUERY_RUNNERS[type]) {
    return new QUERY_RUNNERS[type](options)
  }

  return null
}
