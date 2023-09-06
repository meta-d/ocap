import { Observable } from 'rxjs'
import { ComponentStore, Projector, SelectConfig } from './component-store'

export abstract class Query<State> {
  protected constructor(protected store: ComponentStore<State>, config?: SelectConfig) {}

  /**
   * Creates a selector.
   *
   * @param projector A pure projection function that takes the current state and
   *   returns some new slice/projection of that state.
   * @param config SelectConfig that changes the behavior of selector, including
   *   the debouncing of the values until the state is settled.
   * @return An observable of the projector results.
   */
  //  select<Result>(projector: (s: State) => Result, config?: SelectConfig): Observable<Result>;
  //  select<Selectors extends Observable<unknown>[], Result>(...args: [...selectors: Selectors, projector: Projector<Selectors, Result>]): Observable<Result>;
  select<Selectors extends Observable<unknown>[], Result>(
    ...args: [
      ...selectors: Selectors,
      projector: Projector<Selectors, Result>,
      config: SelectConfig
    ]
  ): Observable<Result> {
    return this.store.select(...args)
  }
}
