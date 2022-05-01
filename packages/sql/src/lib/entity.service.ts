import { AbstractEntityService, QueryOptions, QueryReturn } from '@metad/ocap-core'
import { BehaviorSubject, from, map, Observable, switchMap } from 'rxjs'
import { queryCube } from './query'

export class SQLEntityService<T> extends AbstractEntityService<T> {
  refresh$ = new BehaviorSubject<void>(null)

  override query(options?: QueryOptions): Observable<QueryReturn<T>> {
    const statement = queryCube(
      this.dataSource.options.schema?.cubes,
      options,
      this.entityType,
      this.dataSource.options.dialect
    )
    console.log(statement)
    return this.refresh$.pipe(
      switchMap(() => {
        return from(
          this.dataSource.agent.request(this.dataSource.options, {
            method: 'post',
            url: 'query',
            body: {
              statement: statement
            },
            catalog: this.dataSource.options.catalog
          })
        ).pipe(
          map((result) => {
            return {
              results: result.data,
              columns: result.columns
            }
          })
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
}
