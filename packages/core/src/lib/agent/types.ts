import { Observable } from 'rxjs'
import { DataSourceOptions } from '../data-source'
import { HttpHeaders } from '../types'

export enum AgentType {
  Local,
  Browser,
  Server,
  SQLite,
  Wasm
}

/**
 * 转发请求, 不解析请求内容
 */
export interface Agent {
  type: AgentType
  selectStatus(): Observable<AgentStatus>
  request(dataSource: DataSourceOptions, options: any): Promise<any>
}

export enum AgentStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
  LOADING = 'loading',
  ERROR = 'error'
}

export interface AgentRequestOptions {
  method?: string
  url?: string
  body?: string | string[] | Record<string, unknown>
  headers?: HttpHeaders
  /**
   * Table schema
   */
  catalog?: string
  /**
   * Table name
   */
  table?: string
}