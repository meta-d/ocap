import { AbstractEntityService, PeriodFunctions, Property, QueryOptions, QueryReturn } from '@metad/ocap-core'
import { BehaviorSubject, Observable } from 'rxjs'

/**
 * 要针对错误情况建立一套测试程序
 */
export class ODataEntityService<T> extends AbstractEntityService<T> {
  refresh(): void {
    throw new Error('Method not implemented.')
  }
  query(options?: QueryOptions<any>): Observable<QueryReturn<T>> {
    throw new Error('Method not implemented.')
  }
  selectQuery(options?: QueryOptions<any>): Observable<QueryReturn<T>> {
    throw new Error('Method not implemented.')
  }
  refresh$ = new BehaviorSubject<void>(null)

  get agent() {
    return this.dataSource.agent
  }

  getCalculatedMember(measure: string, type: PeriodFunctions): Property {
    throw new Error('Method not implemented.')
  }
}
