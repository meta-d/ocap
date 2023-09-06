import { AgentType } from '../agent'
import { Syntax } from '../types'
import { Schema } from './sdl'

export type TableColumnType = 'String' | 'Integer' | 'Numeric' | 'Boolean' | 'Datetime' | 'Date'

export interface TableEntity {
  name: string
  type: 'parquet' | 'csv' | 'json' | 'excel'
  sourceUrl: string
  delimiter?: string
  header?: boolean
  sheets?: any
  batchSize?: number
  columns?: Array<{name: string, type: TableColumnType}>
}

export interface SemanticModel {
  /**
   * System id in server
   */
  id?: string
  /**
   * @deprecated use key
   */
  name?: string
  /**
   * Semantic key
   */
  key?: string
  caption?: string
  type: 'SQL' | 'XMLA' | 'OData'
  agentType?: AgentType
  /**
   * 数据查询所使用的语言
   */
  syntax?: Syntax
  /**
   * 数据源内的方言, 如 OData 中有 SAP, Microsoft 等, XMLA 中有 SAP BW, SQL 数据库有 Postgres Mysql Hive 等
   */
  dialect?: string
  /**
   * DB Schema / OData Catalog ...
   */
  catalog?: string

  /**
   * Table defination for wasm database
   */
  tables?: Array<TableEntity>
  /**
   * Initialization Script for wasm database
   */
  dbInitialization?: string

  schema?: Schema
}
