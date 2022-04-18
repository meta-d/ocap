import { ComponentStore } from '@metad/store'
import { Observable } from 'rxjs'
import { ChartAnnotation, QueryReturn } from '../annotations'
import { EntityType } from '../csdl'
import { NxChartEngine } from './chart'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SmartChartEngineState {
  chartAnnotation: ChartAnnotation
  entityType: EntityType
  data: QueryReturn<unknown>
}

export abstract class SmartChartEngine<T extends SmartChartEngineState = SmartChartEngineState>
  extends ComponentStore<T>
  implements NxChartEngine
{
  get chartAnnotation() {
    return this.get((state) => state.chartAnnotation)
  }
  set chartAnnotation(value) {
    this.patchState({chartAnnotation: value} as Partial<T>)
  }
  readonly chartAnnotation$ = this.select(state => state.chartAnnotation)

  get entityType() {
    return this.get(state => state.entityType)
  }
  set entityType(value) {
    this.patchState({entityType: value} as T)
  }
  public readonly entityType$ = this.select(state => state.entityType)

  get data() {
    return this.get(state => state.data)
  }
  set data(value) {
    this.patchState({data: value} as Partial<T>)
  }
  readonly data$ = this.select(state => state.data)

  // store: Store<{ name: string; state: T; config: any }, T> | null = null

  constructor() {
    super({} as T)

    // const { state, config } = createState(withProps<T>({} as T))
    // this.store = new Store({ name: 'smart-chart-engine', state, config })
  }

  selectChartOptions(items: any[]): Observable<any> {
    throw new Error('Method not implemented.')
  }
  changeData(data: any): void {
    throw new Error('Method not implemented.')
  }
  processData(data: any) {
    throw new Error('Method not implemented.')
  }
  onChartOptions(): Observable<any> {
    throw new Error('Method not implemented.')
  }

  override onDestroy(): void {
    super.onDestroy()
  }
}
