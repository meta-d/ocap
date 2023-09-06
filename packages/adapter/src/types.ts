import { Readable } from "stream"

export interface AdapterError {
  message: string
  code: string
  stats: {
    statements: string[]
  }
}

export interface ColumnDef {
  /**
   * Key of data object
   */
  name: string
  /**
   * Name of table column
   */
  fieldName: string
  /**
   * Object value type, convert to db type
   */
  type: string
  /**
   * Is primary key column
   */
  isKey: boolean
  /**
   * length of type for column: varchar, decimal ...
   */
  length?: number
  /**
   * fraction of type for decimal
   */
  fraction?: number
}

/**
 * 与 Server 中类型保持一致
 */
export interface IDSSchema {
  catalog?: string
  schema?: string
  name: string
  label?: string
  type?: string
  tables?: Array<IDSTable>
}

/**
 * 与 Server 中类型保持一致
 */
export interface IDSTable {
  schema?: string
  name?: string
  label?: string
  columns?: Array<IColumnDef>
}

/**
 * 与 Server 中类型保持一致
 */
export interface IColumnDef {
  name: string
  label?: string
  type: string
  nullable?: boolean
  position?: number
  /**
   * 应该等同于 label
   */
  comment?: string
}

export interface CreationTable {
  catalog?: string
  table?: string
  name: string
  columns: ColumnDef[]
  data?: any[]
  file?: File
  mergeType?: 'APPEND' | 'DELETE' | 'MERGE'
  format?: 'csv' | 'json' | 'parquet' | 'orc' | 'data'
  columnSeparator?: string
  withHeader?: number
}

export interface File {
  /** Name of the form field associated with this file. */
  fieldname: string;
  /** Name of the file on the uploader's computer. */
  originalname: string;
  /**
   * Value of the `Content-Transfer-Encoding` header for this file.
   * @deprecated since July 2015
   * @see RFC 7578, Section 4.7
   */
  encoding: string;
  /** Value of the `Content-Type` header for this file. */
  mimetype: string;
  /** Size of the file in bytes. */
  size: number;
  /**
   * A readable stream of this file. Only available to the `_handleFile`
   * callback for custom `StorageEngine`s.
   */
  stream: Readable;
  /** `DiskStorage` only: Directory to which this file has been uploaded. */
  destination: string;
  /** `DiskStorage` only: Name of this file within `destination`. */
  filename: string;
  /** `DiskStorage` only: Full path to the uploaded file. */
  path: string;
  /** `MemoryStorage` only: A Buffer containing the entire file. */
  buffer: Buffer;
}