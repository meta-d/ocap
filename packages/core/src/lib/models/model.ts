import { AgentType } from '../agent'
import { Syntax } from '../types'
import { Schema } from './sdl'

export interface TableEntity {
  name: string
  type: 'parquet' | 'csv' | 'json'
  sourceUrl: string
  delimiter?: string
}

export interface SemanticModel {
  id?: string
  name?: string
  type: 'SQL' | 'XMLA'
  agentType?: AgentType
  /**
   * 数据查询所使用的语言
   */
  syntax?: Syntax
  /**
   * 数据源内的方言, 如 OData 中有 SAP, Microsoft 等, XMLA 中有 SAP BW, SQL 数据库有 Postgres Mysql Hive 等
   */
  dialect?: string
  schemaName?: string
  tables?: Array<TableEntity>

  schema?: Schema
}
