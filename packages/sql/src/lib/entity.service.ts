import { AbstractEntityService, PeriodFunctions, Property, QueryOptions, QueryReturn } from '@metad/ocap-core'
import { BehaviorSubject, catchError, from, map, Observable, of, switchMap } from 'rxjs'
import { queryCube } from './query'
import { serializeWrapCatalog } from './types'

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
              this.dataSource.options.dialect
            )
          } catch (error) {
            console.error(error)
            this.agent.error(error)
            return of({
              error
            })
          }
        }
        
        statement = serializeWrapCatalog(
          statement,
          this.dataSource.options.dialect,
          this.dataSource.options.catalog
        )

        console.log(`[SQL Entity Service] statement:`, statement)

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
          map((result) => {
            return {
              data: result.data,
              results: result.data,
              schema: {
                columns: result.columns
              }
            }
          }),
          // 需要在这里捕捉错误, 否则会终端 refresh 的这个 switchMap
          catchError(err => {
            console.error(err)
            this.agent.error(err)
            return of({data: [], error: err.error?.message})
          }),
        ) as unknown as Observable<QueryReturn<T>>
      })
    )
  }

  override refresh() {
    this.refresh$.next()
  }

  execSQL(
    modelName: string,
    statement: string
  ): Promise<{ data: Array<unknown>; columns: Array<unknown>; error: unknown }> {
    return this.dataSource.agent
      .request(this.dataSource.options, {
        method: 'post',
        url: 'query',
        body: statement,
        catalog: this.dataSource.options.catalog
      })
      .catch((err) => {
        console.error(err)
        throw err
      })
  }

  getCalculatedMember(measure: string, type: PeriodFunctions): Property {
    throw new Error('Method not implemented.')
  }
}
