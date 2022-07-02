import { AbstractEntityService, PeriodFunctions, Property, QueryOptions, QueryReturn } from '@metad/ocap-core'
import { BehaviorSubject, catchError, from, map, Observable, of, switchMap } from 'rxjs'
import { queryCube } from './query'
import { serializeWrapCatalog, SQLQueryResult } from './types'


/**
 * 要针对错误情况建立一套测试程序
 */
export class SQLEntityService<T> extends AbstractEntityService<T> {
  refresh$ = new BehaviorSubject<void>(null)

  get agent() {
    return this.dataSource.agent
  }

  override query(options?: QueryOptions): Observable<QueryReturn<T>> {
    return this.refresh$.pipe(
      switchMap(() => {
        let statement = options?.statement
        if (!statement) {
          try {
            statement = queryCube(
              this.dataSource.options.schema,
              options,
              this.entityType,
              this.dataSource.options.dialect,
              this.dataSource.options.catalog,
            )
          } catch (error) {
            console.error(error)
            this.agent.error(error)
            return of({
              error
            })
          }
        }

        statement = serializeWrapCatalog(statement, this.dataSource.options.dialect, this.dataSource.options.catalog)

        console.log(statement)
        
        return from(
          this.dataSource.agent.request(this.dataSource.options, {
            method: 'post',
            url: 'query',
            body: {
              statement: statement,
              forceRefresh: options.force
            },
            catalog: this.dataSource.options.catalog
          })
        ).pipe(
          map((result: SQLQueryResult) => {

            console.group('[SQL Entity Service] query')
            console.log(`query options:`, options)
            console.log(`entityType:`, this.entityType)
            console.log(`statement:`, statement)
            console.log(`sql result:`, result)
            console.groupEnd()

            return {
              ...result,
              data: result.data,
              schema: {
                columns: result.columns,
              },
            }
          }),
          // 需要在这里捕捉错误, 否则会终端 refresh 的这个 switchMap
          catchError((err) => {
            let error: string
            if (typeof err === 'string') {
              error = err
            } else if (err instanceof Error) {
              error = err?.message
            } else if (err?.error instanceof Error) {
              error = err?.error?.message
            } else {
              error = err
            }

            console.group('[SQL Entity Service] query')
            console.log(`query options:`, options)
            console.log(`entityType:`, this.entityType)
            console.log(`statement:`, statement)
            console.log(`error:`, error)
            console.groupEnd()

            this.agent.error(error)
            return of({ data: [], error })
          })
        ) as unknown as Observable<QueryReturn<T>>
      })
    )
  }

  override refresh() {
    this.refresh$.next()
  }

  getCalculatedMember(measure: string, type: PeriodFunctions): Property {
    throw new Error('Method not implemented.')
  }
}
