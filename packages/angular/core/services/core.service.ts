import { Injectable, inject } from '@angular/core'
import { CalculationProperty, DataSettings, ParameterProperty } from '@metad/ocap-core'
import { Subject } from 'rxjs'
import { NGM_DATE_VARIABLES } from '../models'

export interface EntityUpdateEvent {
  type: 'Parameter' | 'Calculation'
  dataSettings: DataSettings
  parameter?: ParameterProperty
  property?: CalculationProperty
}

@Injectable()
export class NgmOcapCoreService {
  protected dateVariables = inject(NGM_DATE_VARIABLES)

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

  getDateVariables() {
    return this.dateVariables
  }

  execDateVariables(id: string): Date | [Date, Date] {
    const dateVariable = this.dateVariables.find((item) => item.id === id)
    if (!dateVariable) {
      try {
        return new Date(id)
      } catch (err) {
        throw new Error(`Can't found date variable or date '${id}'`)
      }
    }

    return dateVariable.useFactory(dateVariable.deps?.map((dep) => this.execDateVariables(dep)))
  }

  openCalculation() {
    
  }
}
