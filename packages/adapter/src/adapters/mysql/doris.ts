import * as _axios from 'axios'
import { Readable } from 'stream'
import { register } from '../../base'
import { SkipHeaderTransformStream, typeToStarrocksDB } from '../../helpers'
import { CreationTable, File } from '../../types'
import { MySQLRunner, MysqlAdapterOptions } from './mysql'

const axios = _axios.default

export const DORIS_TYPE = 'doris'
export const STARROCKS_TYPE = 'starrocks'

export interface DorisAdapterOptions extends MysqlAdapterOptions {
  apiHost?: string
  apiPort?: number
}

export class DorisRunner extends MySQLRunner<DorisAdapterOptions> {
  readonly name: string = 'Doris'
  readonly type: string = DORIS_TYPE

  get configurationSchema() {
    return {
      type: 'object',
      properties: {
        host: { type: 'string' },
        port: { type: 'number', default: 9030 },
        username: { type: 'string', title: 'Username' },
        password: { type: 'string', title: 'Password' },
        apiHost: { type: 'string' },
        apiPort: { type: 'number', default: 8030 },
        version: { type: 'number', default: 0 },
        catalog: { type: 'string' },
        database: { type: 'string' },
        // for SSL
        use_ssl: { type: 'boolean', title: 'Use SSL' },
        ssl_cacert: {
          type: 'textarea',
          title: 'CA certificate',
          depend: 'use_ssl'
        },
        ssl_cert: {
          type: 'textarea',
          title: 'Client certificate',
          depend: 'use_ssl'
        },
        ssl_key: {
          type: 'textarea',
          title: 'Client key',
          depend: 'use_ssl'
        },

        queryTimeout: {
          type: 'number',
          title: 'Query timeout',
        }
      },
      order: ['host', 'port', 'apiHost', 'apiPort', 'username', 'password'],
      required: [],
      secret: ['password']
    }
  }

  /**
   * Import data into db
   * * Create table if not exist
   *
   * @param params
   * @returns
   */
  async import(params: CreationTable, options?: { catalog?: string }): Promise<void> {
    const { name, columns, data, file, format, mergeType } = params

    const database = options?.catalog ?? this.options?.catalog
    const connection = this._connection(database)

    const statements = []
    try {
      // Recreate table when append mode
      if (mergeType === 'DELETE') {
        const keys = columns.filter(({ isKey }) => isKey).map(({ fieldName }) => `\`${fieldName}\``)
        if (!keys.length) {
          throw new Error(`Olap table should use key fields for 'DISTRIBUTED BY HASH'`)
        }
        const dropTableStatement = `DROP TABLE IF EXISTS \`${name}\``
        const createTableStatement = `CREATE TABLE IF NOT EXISTS \`${name}\` (${columns
          .map((col) => `\`${col.fieldName}\` ${typeToStarrocksDB(col.type, col.length, col.fraction)}`)
          .join(', ')}) UNIQUE KEY (${keys.join(',')}) COMMENT "${name}" DISTRIBUTED BY HASH(${keys.join(
          ','
        )}) BUCKETS 10 PROPERTIES("replication_num" = "1")`
        statements.push(dropTableStatement)
        statements.push(createTableStatement)
        await this.query(connection, dropTableStatement)
        await this.query(connection, createTableStatement)
      }

      if (format && format !== 'data') {
        return await this.streamLoad(database, name, file, params)
      }

      const values = data.map((row) => columns.map(({ name }) => row[name]))
      const insertStatement = `INSERT INTO \`${name}\` (${columns
        .map(({ fieldName }) => `\`${fieldName}\``)
        .join(',')}) VALUES ?`
      statements.push(insertStatement)
      await this.query(connection, insertStatement, [values])
    } catch (err: any) {
      throw {
        message: err.message,
        stats: {
          statements
        }
      }
    } finally {
      connection.end()
    }

    return null
  }

  async streamLoad(database: string, table: string, file: File, params: CreationTable) {
    const { host, apiHost, apiPort, use_ssl } = this.options
    const url = `${use_ssl ? 'https' : 'http'}://${apiHost || host}:${
      apiPort || '8030'
    }/api/${database}/${table}/_stream_load`
    let fileStream = file.buffer ? Readable.from(file.buffer) : file.stream
    const authorization = Buffer.from(`${this.options.username}:${this.options.password}`).toString('base64')
    const headers: any = {
      Authorization: `Basic ${authorization}`,
      columns: params.columns.map(({ fieldName }) => fieldName).join(','),
      format: params.format
    }
    if (params.format === 'csv') {
      headers.column_separator = params.columnSeparator || ','
      if (params.withHeader) {
        if (this.type === DORIS_TYPE) {
          headers.format = 'csv_with_names'
        } else {
          // for Starrocks
          headers.skip_header = 1
          if (this.options.version < 3) {
            fileStream = fileStream.pipe(new SkipHeaderTransformStream())
          }
        }
      } else {
        // for Starrocks
        headers.skip_header = 0
      }
      // for Starrocks
      headers.Expect = '100-continue'
    } else if (params.format === 'json') {
      headers.strict_mode = true
    }
    const result = await axios.put(url, fileStream, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })

    if (result.status === 200) {
      if (result.data.Status === 'Success') {
        return result.data
      } else {
        throw new Error(result.data.Message)
      }
    }

    throw new Error(result.data.Message)
  }
}

export class StarRocksRunner extends DorisRunner {
  readonly name: string = 'StarRocks'
  readonly type: string = STARROCKS_TYPE

  /**
   * Import data into db
   * * Create table if not exist
   *
   * @param params
   * @returns
   */
  async import(params: CreationTable, options?: { catalog?: string }): Promise<void> {
    const { name, columns, data, file, format, mergeType } = params

    // Connection
    const database = options?.catalog ?? this.options?.catalog
    const connection = this._connection(database)

    const statements = []
    try {
      // Recreate table when append mode
      if (mergeType === 'DELETE') {
        // Must set key fields for 'DISTRIBUTED BY HASH'
        const keys = columns.filter(({ isKey }) => isKey).map(({ fieldName }) => `\`${fieldName}\``)
        if (!keys.length) {
          throw new Error(`Olap table should use key fields for 'DISTRIBUTED BY HASH'`)
        }

        const dropTableStatement = `DROP TABLE IF EXISTS \`${name}\``
        const createTableStatement = `CREATE TABLE IF NOT EXISTS \`${name}\` (${columns
          .map((col) => `\`${col.fieldName}\` ${typeToStarrocksDB(col.type, col.length)}`)
          .join(', ')}) PRIMARY KEY (${keys.join(',')}) COMMENT "${name}" DISTRIBUTED BY HASH(${keys.join(
          ','
        )}) BUCKETS 10 PROPERTIES("replication_num" = "1")`
        statements.push(dropTableStatement)
        statements.push(createTableStatement)
        await this.query(connection, dropTableStatement)
        await this.query(connection, createTableStatement)
      }

      // File stream load
      if (format && format !== 'data') {
        return await this.streamLoad(database, name, file, params)
      }

      // Insert data using batch sql
      const values = data.map((row) => columns.map(({ name }) => row[name]))
      const insertStatement = `INSERT INTO \`${name}\` (${columns
        .map(({ fieldName }) => `\`${fieldName}\``)
        .join(',')}) VALUES ?`

      statements.push(insertStatement)
      await this.query(connection, insertStatement, [values])
    } catch (err: any) {
      throw {
        message: err.message,
        stats: {
          statements
        }
      }
    } finally {
      connection.end()
    }

    return null
  }
}

register(DORIS_TYPE, DorisRunner)
register(STARROCKS_TYPE, StarRocksRunner)
