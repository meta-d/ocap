import negate from 'lodash/negate'
import isNil from 'lodash/isNil'
import assign from 'lodash/assign'
import {
  isObservable,
  Observable,
  of,
  Subscription,
  throwError,
  queueScheduler,
  scheduled,
  Subject,
  asyncScheduler,
} from 'rxjs';
import {
  concatMap,
  takeUntil,
  withLatestFrom,
  filter,
} from 'rxjs/operators';
import { ComponentStore } from './component-store';

export interface SubStoreConfig {
  parent: any[]
  arrayKey?: string
}

export class ComponentSubStore<T, P> extends ComponentStore<T> {

  override readonly state$: Observable<T> = this.select((s) => s);

  private parent?: ComponentStore<P>
  private options: SubStoreConfig = {
    parent: []
  }
  constructor(defaultState?: T) {
    super(defaultState)
    // State can be initialized either through constructor or setState.
    // if (defaultState) {
    //   this.initState(defaultState);
    // }
  }

  connect(source: ComponentStore<P>, options?: SubStoreConfig) {
    const initState$ = new Subject<void>()
    this.parent = source
    this.options = options || this.options
    this.options.parent = this.options.parent || []
    source.select(state => this.options.parent.reduce((accumulator, currentValue) => {
        return Array.isArray(accumulator) ? 
          accumulator.find(item => item?.[this.options.arrayKey || 'id'] === currentValue) : 
          accumulator?.[currentValue]
      }, state))
      .pipe(takeUntil(this.destroy$), filter(negate(isNil)))
      .subscribe({
        next: (value) => {
          this.stateSubject$.next(value)
          scheduled([value], asyncScheduler).subscribe(() => {
            initState$.next()
            initState$.complete()
          })
        },
        error: (err) => {
          this.stateSubject$.error(err)
          initState$.error(err)
        },
        complete: () => {
          this.stateSubject$.complete()
          initState$.complete()
        }
      })
    return initState$
  }

  /**
   * Creates an updater.
   *
   * Throws an error if updater is called with synchronous values (either
   * imperative value or Observable that is synchronous) before ComponentStore
   * is initialized. If called with async Observable before initialization then
   * state will not be updated and subscription would be closed.
   *
   * @param updaterFn A static updater function that takes 2 parameters (the
   * current state and an argument object) and returns a new instance of the
   * state.
   * @return A function that accepts one argument which is forwarded as the
   *     second argument to `updaterFn`. Every time this function is called
   *     subscribers will be notified of the state change.
   */
  override updater<
    // Allow to force-provide the type
    ProvidedType = void,
    // This type is derived from the `value` property, defaulting to void if it's missing
    OriginType = ProvidedType,
    // The Value type is assigned from the Origin
    ValueType = OriginType,
    // Return either an empty callback or a function requiring specific types as inputs
    ReturnType = OriginType extends void
      ? () => void
      : (observableOrValue: ValueType | Observable<ValueType>) => Subscription
  >(updaterFn: (state: T, value: OriginType) => void | T): ReturnType {
    return (((
      observableOrValue?: OriginType | Observable<OriginType>
    ): Subscription => {
      let initializationError: Error | undefined;
      // We can receive either the value or an observable. In case it's a
      // simple value, we'll wrap it with `of` operator to turn it into
      // Observable.
      const observable$ = isObservable(observableOrValue)
        ? observableOrValue
        : of(observableOrValue);
      const subscription = observable$
        .pipe(
          concatMap((value) =>
            this.isInitialized
              ? // Push the value into queueScheduler
                scheduled([value], queueScheduler).pipe(
                  withLatestFrom(this.stateSubject$)
                )
              : // If state was not initialized, we'll throw an error.
                throwError(new Error(this.notInitializedErrorMessage))
          ),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: ([value, currentState]) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            // this.stateSubject$.next(updaterFn(currentState, value!));
            this.parent?.updater((state, value: any) => {
              const currentState = this.options.parent.reduce((accumulator, currentValue) => 
                Array.isArray(accumulator) ? accumulator.find(item => item[this.options.arrayKey || 'id'] === currentValue) : accumulator[currentValue], state)
              updaterFn(currentState, value)
            })(value)
          },
          error: (error: Error) => {
            initializationError = error;
            this.stateSubject$.error(error);
          },
        });

      if (initializationError) {
        // prettier-ignore
        throw /** @type {!Error} */ (initializationError);
      }
      return subscription;
    }) as unknown) as ReturnType;
  }

  /**
   * Patches the state with provided partial state.
   *
   * @param partialStateOrUpdaterFn a partial state or a partial updater
   * function that accepts the state and returns the partial state.
   * @throws Error if the state is not initialized.
   */
  override patchState(
    partialStateOrUpdaterFn:
      | Partial<T>
      | Observable<Partial<T>>
      | ((state: T) => Partial<T>)
  ): void {
    const patchedState =
      typeof partialStateOrUpdaterFn === 'function'
        ? partialStateOrUpdaterFn(this.get())
        : partialStateOrUpdaterFn;

    this.updater((state, partialState: Partial<T>) => {
      assign(state, partialState)
    })(patchedState);
  }

}
