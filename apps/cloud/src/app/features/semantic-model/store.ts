import { DestroyRef, computed, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { nonNullable } from '@metad/core'
import { PropsFactory, ReducerContext, Store, StoreConfig, StoreDef, createState } from '@ngneat/elf'
import { produce } from 'immer'
import { cloneDeep, isObject, pick } from 'lodash-es'
import { Observable, Subscription, distinctUntilChanged, filter, map, startWith } from 'rxjs'

export function write<S>(updater: (state: S) => void): (state: S) => S {
  return function (state) {
    return produce(state, (draft) => {
      updater(draft as S)
    })
  }
}

export interface SubStoreConfig extends StoreConfig {
  properties?: any[]
  arrayKey?: string
}

export class SubStore<SDef extends StoreDef = any, State = SDef['state']> extends Store<SDef, State> {
  #destroyRef = inject(DestroyRef)
  #subscription: Subscription
  #upbackSubscription: Subscription

  #context: ReducerContext = {
    config: this.getConfig(),
    setEvent: (action: any) => {}
  }

  constructor(
    private parent: Store,
    storeDef: SDef,
    private options: { properties?: Array<string | number>; arrayKey?: string }
  ) {
    super(storeDef)
  }

  subReducer<T>(state: T, properties: Array<string | number>) {
    return properties.reduce((accumulator, currentValue) => {
      return Array.isArray(accumulator)
        ? accumulator.find((item) => item?.[this.options.arrayKey ?? 'id'] === currentValue)
        : accumulator?.[currentValue]
    }, state)
  }

  connect(properties?: Array<string | number>) {
    properties = this.options.properties = properties ?? this.options.properties
    this.#subscription?.unsubscribe()
    this.#subscription = this.parent
      .pipe(
        startWith(this.parent.getValue()),
        map((state) => this.subReducer(state, this.options.properties)),
        filter(nonNullable),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe({
        next: (value) => {
          console.log(`SubStore [${this.name}] update state from parent:`, value)
          this.update(() => value)
        },
        error: (err) => {
          this.error()
        },
        complete: () => {
          this.complete()
        }
      })

    this.#upbackSubscription?.unsubscribe()
    this.#upbackSubscription = this.pipe(distinctUntilChanged(), takeUntilDestroyed(this.#destroyRef)).subscribe(
      (newValue) => {
        console.log(`SubStore [${this.name}] update back to parent:`, newValue)
        this.parent.update(
          write((state) => {
            properties.reduce((accumulator, currentValue, currentIndex, arr) => {
              if (currentIndex === arr.length - 1) {
                if (Array.isArray(accumulator)) {
                  const index = accumulator.findIndex((item) => item?.[this.options.arrayKey ?? 'id'] === currentValue)
                  if (index > -1) {
                    accumulator[index] = newValue
                  }
                } else if (isObject(accumulator)) {
                  accumulator[currentValue] = newValue
                }
              } else {
                return Array.isArray(accumulator)
                  ? accumulator.find((item) => item?.[this.options.arrayKey ?? 'id'] === currentValue)
                  : accumulator?.[currentValue]
              }
            }, state)
          })
        )
      }
    )
  }

  disconnect() {
    this.#subscription?.unsubscribe()
    this.#upbackSubscription?.unsubscribe()
  }
}

export function createSubStore<T, S extends [PropsFactory<any, any>, ...PropsFactory<any, any>[]]>(
  parent: Store<StoreDef<T>>,
  storeConfig: SubStoreConfig,
  ...propsFactories: S
) {
  const { state, config } = createState(...propsFactories)
  const { name, arrayKey } = storeConfig

  return new SubStore(parent, { name, state, config }, { arrayKey })
}

type Head<State = any> = State | Partial<State>
export type DirtyCheckComparator<State> = (head: State, current: State) => boolean
export type DirtyCheckParams<T = any> = {
  comparator?: DirtyCheckComparator<Head<T>>
  watchProperty?: keyof T | (keyof T)[]
  clean?: (head: Head<T>, current: Head<T>) => Observable<any>
}

export function dirtyCheck(store: Store, params?: DirtyCheckParams) {
  const destroyRef = inject(DestroyRef)
  const active = signal(false)
  const head = signal(null)
  const currentState = signal(null)

  const comparator = params?.comparator ?? ((head, current) => head !== current)
  store
    .pipe(
      map((state) => cloneDeep(params?.watchProperty ? pick(state, params.watchProperty) : state)),
      takeUntilDestroyed(destroyRef)
    )
    .subscribe((value) => currentState.set(value))

  const dirty = computed(() => {
    return active() ? comparator(head(), currentState()) : false
  })
  return {
    active,
    dirty,
    setHead() {
      active.set(true)
      head.set(currentState())
    },
    setPristine(pristine?: unknown) {
      active.set(true)
      head.set(pristine)
    }
  }
}

export function dirtyCheckWith(store: Store, with$: Observable<any>, params?: DirtyCheckParams) {
  const destroyRef = inject(DestroyRef)
  const { setPristine, setHead, ...reset } = dirtyCheck(store, params)
  with$.pipe(takeUntilDestroyed(destroyRef)).subscribe(setPristine)
  return { ...reset }
}
