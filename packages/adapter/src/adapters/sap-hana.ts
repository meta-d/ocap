// import { IDSSchema, IDSTable } from '../types'
// import { createConnection } from '@sap/hana-client'
// import { BaseSQLQueryRunner, QueryResult, register } from '../base'
// import { groupBy } from '../helpers'

// export class HANAQueryRunner extends BaseSQLQueryRunner {
//   readonly name = 'HANA'
//   readonly type = 'hana'
//   readonly syntax = 'sql'
//   readonly protocol = 'sql'

//   readonly jdbcDriver = ''

//   get configurationSchema() {
//     return {
//       type: 'object',
//       properties: {
//         username: { type: 'string' },
//         password: { type: 'string' },
//         host: { type: 'string' },
//         port: { type: 'number' },
//         database: { type: 'string', title: 'Tenant' },
//         schema: { type: 'string', title: 'Schema' },
//         encoding: { type: 'string' },
//       },
//       required: ['username', 'password', 'host', 'port'],
//       extra_options: ['encoding'],
//       secret: ['password'],
//     }
//   }
//   connection
//   constructor(options: Record<string, unknown>) {
//     super(options)

//     this.connection = createConnection()
//   }

//   async execute(query: string, options?: Record<string, unknown>) {
//     const conn_params = {
//       serverNode: `${this.options.host}:${this.options.port}`,
//       uid: this.options.username,
//       pwd: this.options.password,
//       currentSchema: options?.catalog
//     }

//     return new Promise((resolve, reject) => {
//       this.connection.connect(conn_params, (err) => {
//         if (err) {
//           return reject(err)
//         }
//         this.connection.exec(query, [], (err, result) => {
//           if (err) {
//             return reject(err)
//           }
//           this.connection.disconnect()
//           resolve(result)
//         })
//       })
//     })
//   }

//   async runQuery(query: string, options?: Record<string, unknown>) {
//     return this.execute(query, options).then((data: any) => {
//       return {
//         status: 'OK',
//         data
//       } as QueryResult
//     })
//   }

//   async getCatalogs(): Promise<IDSSchema[]> {
//     return this.execute(`SELECT * FROM "SYS"."SCHEMAS"`).then((data: any) => {
//       return data?.map((item) => ({
//         ...item,
//         name: item.SCHEMA_NAME,
//       }))
//     })
//   }

//   async getSchema(catalog?: string, tableName?: string): Promise<IDSTable[]> {
//     let query = ''
//     if (tableName) {
//       query = `SELECT A.SCHEMA_NAME, A.TABLE_NAME, A.COMMENTS AS TABLE_LABEL, COLUMN_NAME, B.COMMENTS AS COLUMN_LABEL, DATA_TYPE_NAME, LENGTH, SCALE, IS_NULLABLE
// FROM "SYS"."TABLES" AS A JOIN "SYS"."TABLE_COLUMNS" AS B
// ON A.SCHEMA_NAME = B.SCHEMA_NAME AND A.TABLE_NAME = B.TABLE_NAME
// WHERE A.SCHEMA_NAME = '${catalog}' AND A.TABLE_NAME = '${tableName}'`

//       // query = `SELECT A.SCHEMA_NAME, A.VIEW_NAME, A.COMMENTS AS VIEW_LABEL, COLUMN_NAME, B.COMMENTS AS COLUMN_LABEL, DATA_TYPE_NAME, LENGTH, SCALE, IS_NULLABLE
//       // FROM "SYS"."VIEWS" AS A JOIN "SYS"."VIEW_COLUMNS" AS B
//       // ON A.SCHEMA_NAME = B.SCHEMA_NAME AND A.VIEW_NAME = B.VIEW_NAME
//       // WHERE A.SCHEMA_NAME = '${catalog}' AND A.VIEW_NAME = '${tableName}'`
//     } else {
//       // query = `SELECT A.SCHEMA_NAME, A.VIEW_NAME, A.COMMENTS AS VIEW_LABEL FROM "SYS"."VIEWS" AS A`
//       query = `SELECT A.SCHEMA_NAME, A.TABLE_NAME, A.COMMENTS AS TABLE_LABEL FROM "SYS"."TABLES" AS A`
//       if (catalog) {
//         query = query + ` WHERE A.SCHEMA_NAME = '${catalog}'`
//       }
//     }

//     return this.execute(query).then((data: any) => {
//       const results = []
//       const schemas = groupBy(data, 'SCHEMA_NAME')
//       Object.keys(schemas).forEach((database) => {
//         const tables = groupBy(schemas[database], 'TABLE_NAME')
//         Object.keys(tables).forEach((name) => {
//           results.push({
//             database,
//             name,
//             label: tables[name][0].VIEW_LABEL,
//             columns: tables[name].filter(item => item.COLUMN_NAME).map((item) => ({
//               name: item.COLUMN_NAME,
//               label: item.COLUMN_LABEL,
//               type: hanaTypeMap(item.DATA_TYPE_NAME),
//               nullable: item.IS_NULLABLE.toLowerCase() === 'true'
//             })),
//           })
//         })
//       })
//       return results
//     })
//   }

//   async teardown() {
//     return null
//   }
// }

// register('hana', HANAQueryRunner)

// export function hanaTypeMap(type: string): string {
//   switch (type?.toLowerCase()) {
//     case 'decimal':
//     case 'numeric':
//     case 'int':
//     case 'integer':
//     case 'float':
//     case 'real':
//     case 'bigint':
//       return 'number'
//     case 'uuid':
//     case 'nvarchar':
//     case 'character varying':
//       return 'string'
//     case 'timestamp without time zone':
//       return 'timestamp'
//     case 'json':
//       return 'object'
//     default:
//       return type
//   }
// }
