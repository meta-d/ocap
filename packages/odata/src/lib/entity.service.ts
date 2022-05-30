import { AbstractEntityService, PeriodFunctions, Property } from '@metad/ocap-core'
import { BehaviorSubject } from 'rxjs'

/**
 * 要针对错误情况建立一套测试程序
 */
export class ODataEntityService<T> extends AbstractEntityService<T> {
  refresh$ = new BehaviorSubject<void>(null)

  get agent() {
    return this.dataSource.agent
  }

  getCalculatedMember(measure: string, type: PeriodFunctions): Property {
    throw new Error('Method not implemented.')
  }
}
