import { Injectable } from '@angular/core'
import { ComponentStore } from '@metad/store'
import { Subject } from 'rxjs'
import { FlexLayout, ID } from '@metad/story/core'

export interface ResponsiveState {
  selected: string
}

@Injectable()
export class ResponsiveService extends ComponentStore<ResponsiveState> {

  readonly selected$ = this.select((state) => state.selected)

  public flexLayoutChange$ = new Subject<FlexLayout>()

  constructor() {
    super({} as ResponsiveState)
  }

  readonly toggle = this.updater((state, key: ID) => {
    state.selected = state.selected === key ? null : key
  })

  readonly active = this.updater((state, key: ID) => {
    state.selected = key
  })

  changeFlexLayout(item: FlexLayout) {
    this.flexLayoutChange$.next(item)
  }
}
