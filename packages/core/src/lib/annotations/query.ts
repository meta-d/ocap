import { Property } from "../csdl"

export interface EntitySchema {
  rows?: Array<Property>
  columns: Array<Property>
}

/**
 * Query 查询返回值类型
 */
export interface QueryReturn<T> {
  results?: Array<T>
  schema?: EntitySchema
  error?: any
}
