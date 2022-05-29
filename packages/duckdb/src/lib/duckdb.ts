import { AsyncDuckDB, AsyncDuckDBConnection, ConsoleLogger, DuckDBBundles, selectBundle } from '@duckdb/duckdb-wasm'
import { Agent, AgentStatus, AgentType, DataSourceOptions, SemanticModel } from '@metad/ocap-core'
import { DataType } from 'apache-arrow'
import { BehaviorSubject, filter, firstValueFrom, map, Observable, ReplaySubject, Subject } from 'rxjs'

const MANUAL_BUNDLES: DuckDBBundles = {
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

  private error$ = new Subject()
  private intial = true
  private db: AsyncDuckDB
  public _connection$ = new BehaviorSubject<AsyncDuckDBConnection>(null)
  public connection$ = this._connection$.asObservable().pipe(filter((value) => !!value))

  private models = {}

  private models$ = new ReplaySubject(1)

  constructor(models: any) {
    models?.forEach((model) => (this.models[model.name] = model))
  }

  error(err: any): void {
    this.error$.next(err)
  }

  async registerModel(model: SemanticModel) {
    const name = model.name
    // 清空相应 Model, 让请求等待新的 Model 初始化完成
    this.models[name] = null
    this.models$.next({ ...this.models })

    const connection = await firstValueFrom(this.connection$)

    try {
      await Promise.all(
        model.tables?.map((entity) => {
          return (async () => {
            await connection.query(`DROP TABLE IF EXISTS "${entity.name}"`)
            if (entity.type === 'parquet') {
              await this.db.registerFileURL(entity.name, entity.sourceUrl)
              return connection.query(`CREATE TABLE "${entity.name}" AS SELECT * FROM read_parquet('${entity.name}')`)
            } else if (entity.type === 'csv') {
              return connection.insertCSVFromPath(entity.sourceUrl, {
                create: true,
                schema: model.schemaName,
                name: entity.name,
                // delimiter: entity.delimiter
              })
            } else if (entity.type === 'json') {
              return connection.insertJSONFromPath(entity.sourceUrl, {
                schema: model.schemaName,
                name: entity.name
              })
            } else {
              throw new Error(`Unsupport type for '${entity.type}'`)
            }
          })()
        }) ?? []
      )
    } catch(error) {
      console.error(error)
      this.error(error)
      // return
    }

    this.models[name] = model
    this.models$.next({ ...this.models })
  }

  async connect() {
    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~ duckdb connecting ~~~~~~~~~~~~~~~~~~~~~~~~~~`)
    // // Select a bundle based on browser checks
    const bundle = await selectBundle(MANUAL_BUNDLES)
    // // Instantiate the asynchronus version of DuckDB-wasm
    const worker = new Worker(bundle.mainWorker as string)
    const logger = new ConsoleLogger()
    this.db = new AsyncDuckDB(logger, worker)
    await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker)

    const connection = await this.db.connect()

    this._connection$.next(connection)
  }

  selectStatus(): Observable<AgentStatus> {
    throw new Error('Method not implemented.')
  }

  selectError(): Observable<any> {
    return this.error$
  }

  async getConnection() {
    return await firstValueFrom(this.connection$)
  }

  async getModel(name: string) {
    return await firstValueFrom(
      this.models$.pipe(
        map((models) => models[name]),
        filter((value) => !!value)
      )
    )
  }

  async request(dataSource: DataSourceOptions, options: any): Promise<any> {
    if (this.intial) {
      this.intial = false
      await this.connect()
    }

    const connection = await this.getConnection()
    const model = await this.getModel(dataSource.name)

    console.log(dataSource, options, model)

    if (options.method === 'get') {
      if (options.url === 'schema') {
        if (options.table) {
          // const results = await this.query(connection, `SELECT * FROM ${options.table} LIMIT 1`)
          const columns = await this.getTableColumns(dataSource.catalog, options.table ?? options.statement)
          return [{
            // database: 'main',
            name: options.table,
            columns
          }]
        } else if(options.statement) {
          const columns = await this.getStatementColumns(dataSource.catalog, options.statement)
          return [{
            // database: 'main',
            name: options.table,
            columns
          }]
        }else {
          return await this.getTables()
        }
      }
    } else if (options.method === 'post') {
      if (options.url === 'query') {
        let results
        try {
          results = await this.query(connection, options.body.statement)
        }catch(error) {
          console.log(error)
          return Promise.reject(error)
        }
        
        const columns = results.schema.fields.map((d) => ({
          name: d.name,
          nullable: d.nullable,
          type: mapArrowType(d.type)
        }))
        const measures = columns.filter((col) => col.type === 'number')
        const rows = results.toArray().map(Object.fromEntries) as any
        // console.log(rows, columns)
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

  async query(connection: AsyncDuckDBConnection, statement: string) {
    // try {
      return await connection.query(statement)
    // }catch(error) {
    //   console.log(error)
    //   return Promise.reject()
    // }
  }

  async getDatabases() {
    const connection = await this.getConnection()
    const results = await this.query(connection, `PRAGMA database_list;`)

    return results
      .toArray()
      .map(Object.fromEntries)
      .map(({ name, file }) => ({
        name,
        type: file
      }))
  }

  async getTables() {
    const connection = await this.getConnection()
    const results = await this.query(connection, `PRAGMA show_tables;`)

    return results
      .toArray()
      .map(Object.fromEntries)
      .map(({ name }) => ({
        name
      }))
  }

  async getTableColumns(schemaName: string, tableName: string) {
    const connection = await this.getConnection()
    const statement = `DESCRIBE ${schemaName ? schemaName + '.' : ''}${tableName}`
    const results = await this.query(connection, statement)

    console.log(`[Duckdb] Execute:`, statement, ` = `, results)

    return results
      .toArray()
      // .map(({ Field, Null, Type }) => ({
      //   name: Field,
      //   nullable: Null === 'YES',
      //   type: mapType(Type)
      // }))
      .map(({ column_name, null: isNull, column_type, key }) => ({
        name: column_name,
        nullable: isNull === 'YES',
        type: mapType(column_type)
      }))
  }

  async getStatementColumns(schemaName: string, statement: string) {
    const connection = await this.getConnection()
    statement = `DESCRIBE ${statement}`
    const results = await this.query(connection, statement)

    console.log(`[Duckdb] Execute:`, statement, ` = `, results)

    return results
      .toArray()
      .map(({ column_name, null: isNull, column_type, key }) => ({
        name: column_name,
        nullable: isNull === 'YES',
        type: mapType(column_type)
      }))
  }
}

export function mapArrowType(type) {
  if (DataType.isDecimal(type) || DataType.isInt(type) || DataType.isFloat(type)) {
    return 'number'
  }

  return 'string'
}

// export async function insertArrowFromIPCStream(c, name, url) {
//   const streamResponse = await fetch(url)
//   const streamReader = streamResponse.body.getReader()
//   const streamInserts = []
//   let conti = true
//   while (conti) {
//     const { value, done } = await streamReader.read()
//     if (done) {
//       conti = false
//       break
//     }
//     streamInserts.push(c.insertArrowFromIPCStream(value, { name }))
//   }
//   return await Promise.all(streamInserts)
// }

export function mapType(type: string) {
  switch (type) {
    case 'BOOLEAN':
      return 'boolean'
    case 'TINYINT':
      return 'number'
    case 'SMALLINT':
      return 'number'
    case 'INTEGER':
      return 'number'
    case 'BIGINT':
      return 'number'
    case 'UTINYINT':
      return 'number'
    case 'USMALLINT':
      return 'number'
    case 'UINTEGER':
      return 'number'
    case 'UBIGINT':
      return 'number'
    case 'FLOAT':
      return 'number'
    case 'HUGEINT':
      return 'number'
    case 'DOUBLE':
      return 'number'
    case 'VARCHAR':
      return 'string'
    case 'DATE':
      return 'date'
    case 'TIME':
      return 'string'
    case 'TIMESTAMP':
      return 'string'
    default:
      return null
  }
}
