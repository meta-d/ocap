import { ClickHouse } from 'clickhouse'
import { BaseSQLQueryRunner, register, SQLAdapterOptions } from '../base'
import { groupBy, typeOfObj } from '../helpers'
import { DBProtocolEnum, DBSyntaxEnum, IDSSchema } from '../types'

export interface ClickHouseAdapterOptions extends SQLAdapterOptions {
  dbname?: string
}

export class ClickHouseRunner extends BaseSQLQueryRunner<ClickHouseAdapterOptions> {
  readonly name = 'ClickHouse'
  readonly type = 'clickhouse'
  readonly syntax = DBSyntaxEnum.SQL
  readonly protocol = DBProtocolEnum.SQL

  readonly jdbcDriver = 'ru.yandex.clickhouse.ClickHouseDriver'

  jdbcUrl(schema?: string) {
    return `jdbc:clickhouse://${this.host}:${this.port}/${this.options.dbname}`
  }

  get configurationSchema() {
    return {
      type: 'object',
      properties: {
        url: { type: 'string', default: 'http://127.0.0.1:8123' },
        host: { type: 'string', default: 'localhost' },
        port: { type: 'number', default: 8123 },
        username: { type: 'string', default: 'default' },
        password: { type: 'string' },
        dbname: { type: 'string', title: 'Database Name' },
        timeout: {
          type: 'number',
          title: 'Request Timeout',
          default: 30,
        },
        verify: {
          type: 'boolean',
          title: 'Verify SSL certificate',
          default: true,
        },
      },
      order: ['url', 'username', 'password', 'dbname'],
      required: ['dbname'],
      extra_options: ['timeout', 'verify'],
      secret: ['password'],
    }
  }

  async runQuery(query: string, options?: any) {
    const url = this.options.url || 'http://127.0.0.1:8123'
    const basicAuth = this.options.username
      ? {
          username: this.options.username,
          password: this.options.password,
        }
      : null

    const clickhouse = new ClickHouse({
      url,
      debug: false,
      basicAuth,
      isUseGzip: false,
      format: 'json', // "json" || "csv" || "tsv"
      raw: false,
      config: {
        // session_id: 'session_id if neeed',
        // session_timeout: 60,
        output_format_json_quote_64bit_integers: 0,
        enable_http_compression: 0,
        database: this.options.dbname,
      },
    })

    return clickhouse
      .query(query)
      .toPromise()
      .then((rows) => {
        let columns = []
        if (rows[0]) {
          columns = typeOfObj(rows[0])
        }
        return { data: rows, columns }
      }) as any
  }

  async getCatalogs(): Promise<IDSSchema[]> {
    const query =
      "SELECT name, engine FROM system.databases WHERE (name NOT IN ('system')) AND (engine NOT IN ('Memory'))"
    return this.runQuery(query).then(({ data }) =>
      data.map((row: any) => ({
        schema: row.name,
        name: row.name,
        type: row.engine,
      }))
    )
  }

  async getSchema(catalog?: string, tableName?: string): Promise<IDSSchema[]> {
    let query = catalog
      ? `SELECT database, table, name, type FROM system.columns WHERE database == '${catalog}'`
      : `SELECT database, table, name, type FROM system.columns WHERE database NOT IN ('system')`
    if (tableName) {
      query += ` AND table == '${tableName}'`
    }
    return this.runQuery(query).then(({ data }) => {
      const databases = groupBy(data, 'database')
      const schemas = []
      Object.entries(databases).forEach(([database, value]: any) => {
        const tableGroup = groupBy(value, 'table')
        const tables = Object.entries(tableGroup).map(([table, columns]: [string, any]) => {
          return {
            schema: database,
            name: table,
            columns: columns.map((item: any) => ({
              name: item.name,
              dataType: item.type,
              type: typeMap(item.type),
            })),
          }
        })

        schemas.push({
          schema: database,
          name: database,
          tables
        })
      })

      return schemas
    })
  }

  async describe(catalog: string, statement: string) {
    if (!statement) {
      return { columns: [] }
    }

    statement = `${statement} LIMIT 1`
    return this.runQuery(statement, { catalog })
  }

  override async createCatalog(catalog: string, options?: {}) {
    await this.runQuery(`CREATE DATABASE IF NOT EXISTS ${catalog}`)
  }

  async teardown() {
    //
  }
}

function typeMap(type) {
  switch (type) {
    case 'Int32':
    case 'Float64':
      return 'number'
    default:
      return 'string'
  }
}

register('clickhouse', ClickHouseRunner)
