import * as duckdb from '@duckdb/duckdb-wasm'
import { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'
import { Agent, AgentStatus, AgentType, DataSourceOptions } from '@metad/ocap-core'
import { DataType } from 'apache-arrow'
import { BehaviorSubject, filter, firstValueFrom, Observable } from 'rxjs'

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: './assets/duckdb-mvp.wasm',
    mainWorker: './assets/duckdb-browser-mvp.worker.js'
  },
  eh: {
    mainModule: './duckdb-eh.wasm',
    mainWorker: './assets/duckdb-browser-eh.worker.js'
  }
}

export class DuckdbWasmAgent implements Agent {
  type = AgentType.Wasm

  private intial = true
  public _connection$ = new BehaviorSubject<AsyncDuckDBConnection>(null)
  public connection$ = this._connection$.asObservable().pipe(filter((value) => !!value))

  constructor(private models: any) {
  }

  async connect() {
    // // Select a bundle based on browser checks
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES)
    // // Instantiate the asynchronus version of DuckDB-wasm
    const worker = new Worker(bundle.mainWorker as string)
    const logger = new duckdb.ConsoleLogger()
    const db = new duckdb.AsyncDuckDB(logger, worker)
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker)

    const connection = await db.connect()
    await Promise.all(this.models[0].entities.map((entity) => {
      return connection.insertCSVFromPath(entity.sourceUrl, {
        schema: this.models[0].schemaName,
        name: entity.name
      })
    }))

    this._connection$.next(connection)
  }

  selectStatus(): Observable<AgentStatus> {
    throw new Error('Method not implemented.')
  }

  async request(dataSource: DataSourceOptions, options: any): Promise<any> {
    if (this.intial) {
      this.intial = false
      await this.connect()
    }

    const connection = await firstValueFrom(this.connection$)

    console.log(dataSource, options)

    if (options.method === 'get') {
      if (options.url === 'schema') {
        if (options.table) {
          const results = await this.query(connection, `SELECT * FROM ${options.table} LIMIT 1`)
          return {
            // database: 'main',
            name: options.table,
            // label: 'Covid-19 日报',
            columns: results.schema.fields.map((d) => ({
              name: d.name,
              nullable: d.nullable,
              type: mapType(d.type)
            }))
          }
        }
      }
    } else if (options.method === 'post') {
      if (options.url === 'query') {
        const results = await this.query(connection, options.body.statement) //  `SELECT Country_Region, Confirmed FROM CsseCovid19DailyUS LIMIT 1`
        const columns = results.schema.fields.map((d) => ({
          name: d.name,
          nullable: d.nullable,
          type: mapType(d.type)
        }))
        const measures = columns.filter((col) => col.type === 'number')
        const rows = results.toArray().map(Object.fromEntries) as any
        console.log(rows, columns)
        return {
          data: rows.map((row) => {
            const item = { ...row }
            measures.forEach(({ name }) => {
              item[name] = item[name] instanceof Uint32Array ? item[name][0] : item[name]
            })
            return item
          }),
          columns
        }
      }
    }

    throw new Error('Method not implemented.')
  }

  async query(connection, statement: string) {
    return await connection.query(statement)
  }
}

export function mapType(type) {
  if (DataType.isDecimal(type) || DataType.isInt(type) || DataType.isFloat(type)) {
    return 'number'
  }

  return 'string'
}
