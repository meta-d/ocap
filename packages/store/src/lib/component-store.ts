import {
  isObservable,
  Observable,
  of,
  ReplaySubject,
  Subscription,
  throwError,
  combineLatest,
  Subject,
  queueScheduler,
  scheduled,
} from 'rxjs';
import {
  concatMap,
  takeUntil,
  withLatestFrom,
  map,
  distinctUntilChanged,
  shareReplay,
  take,
} from 'rxjs/operators';
import { debounceSync } from './debounce-sync';
import { immerReducer } from './immer-reducer'
import { isEmpty, pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid'

export interface SelectConfig {
  debounce?: boolean;
}

export type SelectorResults<Selectors extends Observable<unknown>[]> = {
  [Key in keyof Selectors]: Selectors[Key] extends Observable<infer U>
    ? U
    : never;
};

export type Projector<Selectors extends Observable<unknown>[], Result> = (
  ...args: SelectorResults<Selectors>
) => Result;

// @Injectable()
export class ComponentStore<T> {
  private __id__: string = uuidv4()

  // Should be used only in ngOnDestroy.
  protected readonly destroySubject$ = new ReplaySubject<void>(1);
  // Exposed to any extending Store to be used for the teardown.
  readonly destroy$ = this.destroySubject$.asObservable();

  protected readonly stateSubject$ = new ReplaySubject<T>(1);
  protected isInitialized = false;
  protected notInitializedErrorMessage =
    `${this.constructor.name} has not been initialized yet. ` +
    `Please make sure it is initialized before updating/getting.`;
  // Needs to be after destroy$ is declared because it's used in select.
  readonly state$: Observable<T> = this.select((s) => s);

  constructor(defaultState?: T) {
    // State can be initialized either through constructor or setState.
    if (defaultState) {
      this.initState(defaultState);
    }
    console.log(`Object ${this.__id__} of class ${this.constructor.name} be created`)
  }

  /** Completes all relevant Observable streams. */
  onDestroy() {
    this.stateSubject$.complete();
    this.destroySubject$.next();
    console.log(`Object ${this.__id__} of class ${this.constructor.name} be destroyed`)
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
  updater<
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
                throwError(() => new Error(this.notInitializedErrorMessage))
          ),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: ([value, currentState]) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.stateSubject$.next(immerReducer(updaterFn)(currentState, value!));
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
   * Initializes state. If it was already initialized then it resets the
   * state.
   */
  protected initState(state: T): void {
    this.isInitialized = true;
    this.stateSubject$.next(state);
    // scheduled([state], queueScheduler).subscribe((s) => {
    //   this.isInitialized = true;
    //   this.stateSubject$.next(s);
    // });
  }

  /**
   * Sets the state specific value.
   * @param stateOrUpdaterFn object of the same type as the state or an
   * updaterFn, returning such object.
   */
  setState(stateOrUpdaterFn: T | ((state: T) => T)): void {
    if (typeof stateOrUpdaterFn !== 'function') {
      this.initState(stateOrUpdaterFn);
    } else {
      this.updater(stateOrUpdaterFn as (state: T) => T)();
    }
  }

  /**
   * Patches the state with provided partial state.
   *
   * @param partialStateOrUpdaterFn a partial state or a partial updater
   * function that accepts the state and returns the partial state.
   * @throws Error if the state is not initialized.
   */
  patchState(
    partialStateOrUpdaterFn:
      | Partial<T>
      | Observable<Partial<T>>
      | ((state: T) => Partial<T>)
  ): void {
    const patchedState =
      typeof partialStateOrUpdaterFn === 'function'
        ? partialStateOrUpdaterFn(this.get())
        : partialStateOrUpdaterFn;

    this.updater((state, partialState: Partial<T>) => ({
      ...state,
      ...partialState,
    }))(patchedState);
  }

  protected get(): T;
  protected get<R>(projector: (s: T) => R): R;
  protected get<R>(projector?: (s: T) => R): R | T {
    if (!this.isInitialized) {
      throw new Error(this.notInitializedErrorMessage);
    }
    let value: R | T;

    this.stateSubject$.pipe(take(1)).subscribe((state) => {
      value = projector ? projector(state) : state;
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return value!;
  }

  /**
   * Creates a selector.
   *
   * @param projector A pure projection function that takes the current state and
   *   returns some new slice/projection of that state.
   * @param config SelectConfig that changes the behavior of selector, including
   *   the debouncing of the values until the state is settled.
   * @return An observable of the projector results.
   */
  select<Result>(
    projector: (s: T) => Result,
    config?: SelectConfig
  ): Observable<Result>;
  select<Selectors extends Observable<unknown>[], Result>(
    ...args: [...selectors: Selectors, projector: Projector<Selectors, Result>]
  ): Observable<Result>;
  select<Selectors extends Observable<unknown>[], Result>(
    ...args: [
      ...selectors: Selectors,
      projector: Projector<Selectors, Result>,
      config: SelectConfig
    ]
  ): Observable<Result>;
  select<
    Selectors extends Array<Observable<unknown> | SelectConfig | ProjectorFn>,
    Result,
    ProjectorFn = (...a: unknown[]) => Result
  >(...args: Selectors): Observable<Result> {
    const { observables, projector, config } = processSelectorArgs<
      Selectors,
      Result
    >(args);

    let observable$: Observable<Result>;
    // If there are no Observables to combine, then we'll just map the value.
    if (observables.length === 0) {
      observable$ = this.stateSubject$.pipe(
        config.debounce ? debounceSync() : (source$) => source$,
        map(projector)
      );
    } else {
      // If there are multiple arguments, then we're aggregating selectors, so we need
      // to take the combineLatest of them before calling the map function.
      observable$ = combineLatest(observables).pipe(
        config.debounce ? debounceSync() : (source$) => source$,
        map((projectorArgs) => projector(...projectorArgs))
      );
    }

    return observable$.pipe(
      distinctUntilChanged(),
      shareReplay({
        refCount: true,
        bufferSize: 1,
      }),
      takeUntil(this.destroy$)
    );
  }

  /**
   * Creates an effect.
   *
   * This effect is subscribed to throughout the lifecycle of the ComponentStore.
   * @param generator A function that takes an origin Observable input and
   *     returns an Observable. The Observable that is returned will be
   *     subscribed to for the life of the component.
   * @return A function that, when called, will trigger the origin Observable.
   */
  effect<
    // This type quickly became part of effect 'API'
    ProvidedType = void,
    // The actual origin$ type, which could be unknown, when not specified
    OriginType extends
      | Observable<ProvidedType>
      | unknown = Observable<ProvidedType>,
    // Unwrapped actual type of the origin$ Observable, after default was applied
    ObservableType = OriginType extends Observable<infer A> ? A : never,
    // Return either an empty callback or a function requiring specific types as inputs
    ReturnType = ProvidedType | ObservableType extends void
      ? () => void
      : (
          observableOrValue: ObservableType | Observable<ObservableType>
        ) => Subscription
  >(generator: (origin$: OriginType) => Observable<unknown>): ReturnType {
    const origin$ = new Subject<ObservableType>();
    generator(origin$ as OriginType)
      // tied to the lifecycle 👇 of ComponentStore
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    return (((
      observableOrValue?: ObservableType | Observable<ObservableType>
    ): Subscription => {
      const observable$ = isObservable(observableOrValue)
        ? observableOrValue
        : of(observableOrValue);
      return observable$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
        // any new 👇 value is pushed into a stream
        origin$.next(value as any);
      });
    }) as unknown) as ReturnType;
  }

  sync(source: ComponentStore<T>, options?: {watchProperty?: keyof T | (keyof T)[]}) {
    source.select(state => isEmpty(options?.watchProperty) ? state : pick(state, options?.watchProperty as string[]))
      .pipe(take(1))
      .subscribe(state => {
        this.patchState(state)
      })

    this.select<T>(state => isEmpty(options?.watchProperty) ? state : pick(state, options?.watchProperty as string[]) as T)
      .subscribe((state: T) => {
        source.setState(state)
      })
  }
}

function processSelectorArgs<
  Selectors extends Array<Observable<unknown> | SelectConfig | ProjectorFn>,
  Result,
  ProjectorFn = (...a: unknown[]) => Result
>(
  args: Selectors
): {
  observables: Observable<unknown>[];
  projector: ProjectorFn;
  config: Required<SelectConfig>;
} {
  const selectorArgs = Array.from(args);
  // Assign default values.
  let config: Required<SelectConfig> = { debounce: false };
  let projector: ProjectorFn;
  // Last argument is either projector or config
  const projectorOrConfig = selectorArgs.pop() as ProjectorFn | SelectConfig;

  if (typeof projectorOrConfig !== 'function') {
    // We got the config as the last argument, replace any default values with it.
    config = { ...config, ...projectorOrConfig };
    // Pop the next args, which would be the projector fn.
    projector = selectorArgs.pop() as ProjectorFn;
  } else {
    projector = projectorOrConfig;
  }
  // The Observables to combine, if there are any.
  const observables = selectorArgs as Observable<unknown>[];
  return {
    observables,
    projector,
    config,
  };
}
