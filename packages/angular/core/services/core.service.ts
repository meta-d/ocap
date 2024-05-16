import { Injectable } from '@angular/core'
import { CalculationProperty, DataSettings, ParameterProperty } from '@metad/ocap-core'
import { Subject } from 'rxjs'

export interface EntityUpdateEvent {
  type: 'Parameter' | 'Calculation'
  dataSettings: DataSettings
  parameter?: ParameterProperty
  property?: CalculationProperty
}

@Injectable()
export class NgmOcapCoreService {
  /**
   * 接收各组件创建修改计算字段的事件, 发给组件进行实际更新
   * 暂时使用这种间接的方式
   */
  readonly #entityUpdateEvent$ = new Subject<EntityUpdateEvent>()

  updateEntity(event: EntityUpdateEvent) {
    this.#entityUpdateEvent$.next(event)
  }

  onEntityUpdate() {
    return this.#entityUpdateEvent$.asObservable()
  }
}
