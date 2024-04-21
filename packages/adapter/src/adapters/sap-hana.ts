import { Connection, createConnection } from '@sap/hana-client'
import { BaseSQLQueryRunner, QueryResult, SQLAdapterOptions, register } from '../base'
import { groupBy } from '../helpers'
import { CreationTable, IDSSchema, QueryOptions } from '../types'

export interface HANAAdapterOptions extends SQLAdapterOptions {
  database: string
}

export class HANAQueryRunner extends BaseSQLQueryRunner<HANAAdapterOptions> {
  readonly name = 'HANA'
  readonly type = 'hana'
  readonly syntax = 'sql'
  readonly protocol = 'sql'

  readonly jdbcDriver = 'com.sap.db.jdbc.Driver'
  jdbcUrl(schema?: string) {
    return `jdbc:sap://${this.options.host}:${this.options.port}/?databaseName=${this.options.database}&currentSchema=${schema}&user=${encodeURIComponent(
      this.options.username as string
    )}&password=${encodeURIComponent(this.options.password as string)}`
  }

  get configurationSchema() {
    return {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
        host: { type: 'string' },
        port: { type: 'number' },
        database: { type: 'string', title: 'Tenant' },
        catalog: { type: 'string', title: 'Schema' },
        // schema: { type: 'string', title: 'Schema' },
        encoding: { type: 'string' }
      },
      required: ['username', 'password', 'host', 'port', 'database'],
      extra_options: ['encoding'],
      secret: ['password']
    }
  }

  private connection: Connection

  constructor(options: HANAAdapterOptions) {
    super(options)

    this.connection = createConnection()
  }

  async connect(options?: QueryOptions): Promise<Connection> {
    const conn_params = {
      serverNode: `${this.options.host}:${this.options.port}`,
      uid: this.options.username,
      pwd: this.options.password,
      currentSchema: options?.catalog,
      databaseName: this.options.database
    }

    return new Promise((resolve, reject) => {
      if (this.connection.state() === 'connected') {
        resolve(this.connection)
      } else {
        console.log(`Connecting to HANA DB:`, conn_params)
        this.connection.connect(conn_params, (err) => {
          if (err) {
            return reject(err)
          }
          resolve(this.connection)
        })
      }
    })
  }

  async execute(query: string, options?: QueryOptions) {
    await this.connect(options)

    return new Promise((resolve, reject) => {
      this.connection.exec(query, [], (err, result) => {
        if (err) {
          return reject(err)
        }
        this.connection.disconnect()
        resolve(result)
      })
    })
  }

  /**
   * Execute a sql statement in HANA DB
   *
   * @param query sql statement
   * @param options
   * @returns
   */
  async runQuery(query: string, options?: Record<string, unknown>) {
    return this.execute(query, options).then((data: any) => {
      return {
        status: 'OK',
        data
      } as QueryResult
    })
  }

  async getCatalogs(): Promise<IDSSchema[]> {
    return this.execute(`SELECT * FROM "SYS"."SCHEMAS"`).then((data: any) => {
      return data?.map((item) => ({
        ...item,
        schema: item.SCHEMA_NAME,
        name: item.SCHEMA_NAME
      }))
    })
  }

  override async getSchema(catalog?: string, tableName?: string): Promise<IDSSchema[]> {
    let query = ''
    if (tableName) {
      const tableCondition = `A.TABLE_NAME = '${tableName}'`
      const whereCondition = catalog ? `A.SCHEMA_NAME = '${catalog}' AND ${tableCondition}` : tableCondition
      query = `SELECT A.SCHEMA_NAME, A.TABLE_NAME, A.COMMENTS AS TABLE_LABEL, COLUMN_NAME, B.COMMENTS AS COLUMN_LABEL, DATA_TYPE_NAME, LENGTH, SCALE, IS_NULLABLE
FROM "SYS"."TABLES" AS A JOIN "SYS"."TABLE_COLUMNS" AS B
ON A.SCHEMA_NAME = B.SCHEMA_NAME AND A.TABLE_NAME = B.TABLE_NAME
WHERE ${whereCondition}`
      // query = `SELECT A.SCHEMA_NAME, A.VIEW_NAME, A.COMMENTS AS VIEW_LABEL, COLUMN_NAME, B.COMMENTS AS COLUMN_LABEL, DATA_TYPE_NAME, LENGTH, SCALE, IS_NULLABLE
      // FROM "SYS"."VIEWS" AS A JOIN "SYS"."VIEW_COLUMNS" AS B
      // ON A.SCHEMA_NAME = B.SCHEMA_NAME AND A.VIEW_NAME = B.VIEW_NAME
      // WHERE A.SCHEMA_NAME = '${catalog}' AND A.VIEW_NAME = '${tableName}'`
    } else {
      // query = `SELECT A.SCHEMA_NAME, A.VIEW_NAME, A.COMMENTS AS VIEW_LABEL FROM "SYS"."VIEWS" AS A`
      query = `SELECT A.SCHEMA_NAME, A.TABLE_NAME, A.COMMENTS AS TABLE_LABEL FROM "SYS"."TABLES" AS A`
      if (catalog) {
        query = query + ` WHERE A.SCHEMA_NAME = '${catalog}'`
      }
    }

    return this.execute(query).then((data: any) => {
      const tables = []
      const schemas = groupBy(data, 'SCHEMA_NAME')
      Object.keys(schemas).forEach((database) => {
        const tableGroups = groupBy(schemas[database], 'TABLE_NAME')
        Object.keys(tableGroups).forEach((name) => {
          tables.push({
            database,
            schema: database,
            name,
            label: tableGroups[name][0].VIEW_LABEL,
            columns: tableGroups[name]
              .filter((item) => item.COLUMN_NAME)
              .map((item) => ({
                name: item.COLUMN_NAME,
                label: item.COLUMN_LABEL,
                type: hanaTypeMap(item.DATA_TYPE_NAME),
                nullable: item.IS_NULLABLE.toLowerCase() === 'true'
              }))
          })
        })
      })
      return [
        {
          schema: catalog,
          name: catalog,
          tables
        }
      ]
    })
  }

  /**
   * Create HANA schema (catalog)
   *
   * @param catalog HANA Schema name
   * @param options ownedBy: 'SYSTEM'
   */
  override async createCatalog(
    catalog: string,
    options?: {
      ownedBy: string
    }
  ) {
    const { ownedBy } = options ?? { ownedBy: 'SYSTEM' }
    const schemas = await this.getSchema(catalog)
    if (schemas.length === 0) {
      await this.runQuery(`CREATE SCHEMA ${catalog} OWNED BY ${ownedBy}`)
    }
  }

  async ping(): Promise<void> {
    await this.runQuery(`SELECT * FROM "DUMMY"`)
  }

  async import(params: CreationTable, options?: { catalog?: string }): Promise<void> {
    const { name, columns, data, mergeType } = params

    if (!data?.length) {
      throw new Error(`data is empty`)
    }

    const tableName = `"${name}"` // options?.catalog ? `"${options.catalog}"."${name}"` :
    // const dropTableStatement = `DROP TABLE IF EXISTS ${tableName}`
    const createTableStatement = `CREATE COLUMN TABLE ${tableName} (${columns
      .map(
        (col) => `"${col.fieldName}" ${typeToHANADB(col.type, col.isKey, col.length)}${col.isKey ? ' PRIMARY KEY' : ''}`
      )
      .join(', ')} )`
    const values = data.map((row) =>
      columns.map(({ name, type, length }) => {
        if (type === 'Date' && row[name] instanceof Date) {
          return row[name].toISOString().slice(0, length ?? 10)
        } else {
          return row[name]
        }
      })
    )

    try {
      if (mergeType === 'DELETE') {
        await this.dropTable(name, options)
      }

      await this.execute(createTableStatement, options)

      const conn = await this.connect(options)
      const stmt = conn.prepare(
        `INSERT INTO ${tableName} (${columns.map(({ fieldName }) => `"${fieldName}"`).join(',')}) VALUES(${columns
          .map(() => '?')
          .join(',')})`
      )

      console.log(`Insert data:`, stmt, values)
      return new Promise((resolve, reject) => {
        stmt.execBatch(values, function (err, rows) {
          if (err) {
            return reject(err)
          }
          resolve(rows)
        })
      })
    } catch (err: any) {
      throw {
        message: err.message,
        stats: {
          statements: [createTableStatement]
        }
      }
    }

    // throw new Error(`Method 'import' of HANA DB adapter not implemented.`)
  }

  async dropTable(name: string, options?: QueryOptions): Promise<void> {
    const schemas = await this.getSchema(options.catalog, name)
    if (schemas[0]?.tables?.length > 0) {
      await this.execute(`DROP TABLE "${name}"`, options)
    }
  }

  async teardown() {
    this.connection.disconnect()
  }
}

register('hana', HANAQueryRunner)

export function hanaTypeMap(type: string): string {
  switch (type?.toLowerCase()) {
    case 'decimal':
    case 'numeric':
    case 'int':
    case 'integer':
    case 'float':
    case 'real':
    case 'bigint':
      return 'number'
    case 'uuid':
    case 'nvarchar':
    case 'character varying':
      return 'string'
    case 'timestamp without time zone':
      return 'timestamp'
    case 'json':
      return 'object'
    default:
      return type
  }
}

function typeToHANADB(type: string, isKey: boolean, length: number) {
  switch (type) {
    case 'number':
    case 'Number':
      return 'INT'
    case 'Numeric':
      return 'DECIMAL'
    case 'string':
    case 'String':
      // Max length 3072 btye for primary key
      if (length !== null && length !== undefined) {
        return isKey ? `NVARCHAR(${Math.min(length, 768)})` : `NVARCHAR(${length})`
      }
      return isKey ? 'NVARCHAR(768)' : 'NVARCHAR(1000)'
    case 'date':
    case 'Date':
      return 'DATE'
    case 'Datetime':
    case 'datetime':
      return 'DATETIME'
    case 'boolean':
    case 'Boolean':
      return 'BOOLEAN'
    default:
      return 'NVARCHAR(1000)'
  }
}
