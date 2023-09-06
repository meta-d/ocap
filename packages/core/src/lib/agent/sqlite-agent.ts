// import { randFloat, randProductAdjective, randProductCategory } from '@ngneat/falso'
// import { openDB } from 'idb'
// import { BehaviorSubject, firstValueFrom, Observable, of } from 'rxjs'
// import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators'
// import initSqlJs from 'sql.js'
// import { AggregationRole } from '../csdl'
// import { DataSourceOptions } from '../data-source'
// import { Agent, AgentStatus, AgentType } from './types'

// export class SQLiteAgent implements Agent {
//   type = AgentType.SQLite

//   sqliteDB = new SQLiteDB()

//   selectStatus(): Observable<AgentStatus> {
//     return of(AgentStatus.ONLINE)
//   }

//   request(dataSource: DataSourceOptions, options: any): Promise<any> {
//     console.log(`~~~~~~~~~~~~~~~~~~~~`, dataSource, options)

//     return firstValueFrom(this.sqliteDB.exec('select * from sss;'))
    
//     return new Promise((resolve, reject) => {
//       if (options.method === 'get') {
//         if (options.url === 'schema') {
//           if (options.table === 'SalesOrder') {
//             return resolve({
//               name: 'SalesOrder',
//               label: '销售订单',
//               columns: [
//                 {
//                   name: 'product',
//                   label: '产品',
//                   type: 'string',
//                   aggregationRole: AggregationRole.dimension
//                 },
//                 {
//                   name: 'productCategory',
//                   label: '产品类别',
//                   type: 'string',
//                   aggregationRole: AggregationRole.dimension
//                 },
//                 {
//                   name: 'sales',
//                   label: '销售额',
//                   type: 'number',
//                   aggregationRole: AggregationRole.measure
//                 }
//               ]
//             })
//           }
//         }
//       } else if (options.method === 'post') {
//         if (options.url === 'query') {
//           const results = []
//           randProductCategory({ length: 3 }).forEach((productCategory) => {
//             randProductAdjective({ length: 5 }).forEach((product) => {
//               results.push({
//                 product,
//                 productCategory,
//                 sales: randFloat()
//               })
//             })
//           })
//           return resolve({
//             data: results,
//             columns: []
//           })
//         }
//       }

//       resolve({})
//     })
//   }
// }

// export class SQLiteDB {
//   INDEXED_DB_NAME = 'default'
//   indexedDB
//   private database$ = new BehaviorSubject<any>(null)
//   constructor() {
//     this.onInit().then(() => {
//       console.warn(`SQLite 初始化成功`)
//     })
//   }

//   async onInit() {
//     // eslint-disable-next-line @typescript-eslint/no-this-alias
//     const that = this
//     this.indexedDB = await openDB(this.INDEXED_DB_NAME, 1, {
//       upgrade(db) {
//         console.warn(db)
//         // Create a store of objects
//         const store = db.createObjectStore(that.INDEXED_DB_NAME, {
//           // If it isn't explicitly set, create a value by auto incrementing.
//           autoIncrement: true
//         })
//       }
//     })

//     let dbList = null
//     try {
//       dbList = await this.indexedDB.getAll(this.INDEXED_DB_NAME)
//     } catch (err) {
//       console.warn(err)
//     }

//     let database
//     const SQL = await initSqlJs()
//     if (dbList?.length > 0) {
//       const buffer = await dbList[0].arrayBuffer()
//       console.warn(buffer)
//       database = new SQL.Database(new Uint8Array(buffer))
//     } else {
//       database = new SQL.Database()
//     }

//     this.database$.next(database)
//   }

//   saveDB(): Observable<void> {
//     const db = this.database$.getValue()
//     return of(this.indexedDB.clear(this.INDEXED_DB_NAME)).pipe(
//       switchMap(() => {
//         return of(this.indexedDB.put(this.INDEXED_DB_NAME, new Blob([db['export']()])))
//       })
//     )
//   }

//   exec(statement) {
//     return this.database$.pipe(
//       filter((_) => _ !== null),
//       take(1),
//       tap(() => console.debug(statement)),
//       map((database) => database.exec(statement)),
//     //   catchError((err, caught) => {
//     //     console.error(err)
//     //     return of([])
//     //   })
//     )
//   }
// }
