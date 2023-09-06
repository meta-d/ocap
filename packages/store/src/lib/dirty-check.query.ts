import { BehaviorSubject, Observable, of } from 'rxjs'
import { distinctUntilChanged, filter, map } from 'rxjs/operators'
import { Query } from './query'
import { ComponentStore } from './component-store'
import { cloneDeep, pick } from './utils'

type Head<State = any> = State | Partial<State>

export type DirtyCheckComparator<State> = (head: State, current: State) => boolean

export type DirtyCheckParams<T = any> = {
  comparator?: DirtyCheckComparator<Head<T>>
  watchProperty?: keyof T | (keyof T)[]
  clean?: (head: Head<T>, current: Head<T>) => Observable<any>
}

export const dirtyCheckDefaultParams = {
  comparator: (head, current) => JSON.stringify(head) !== JSON.stringify(current),
}

export class DirtyCheckQuery<T = any> extends Query<T> {
  private active: boolean
  private head: Head<T>
  private dirty$ = new BehaviorSubject<boolean>(false)
  isDirty$: Observable<boolean> = this.dirty$.asObservable().pipe(distinctUntilChanged(), filter(() => this.active))
  isCleaning$ = new BehaviorSubject<boolean>(null)

  private previousKey: Head<T>

  constructor(
    override store: ComponentStore<T>,
    private params?: DirtyCheckParams<T>,
    private _entityId?: any
  ) {
    super(store)
    this.params = { ...dirtyCheckDefaultParams, ...params }
    if (this.params.watchProperty) {
      const watchProp = coerceArray(this.params.watchProperty) as any[]
      this.params.watchProperty = watchProp
    }

    this.store
      .select((state) => state)
      .pipe(
        map((state) => {
          this.previousKey = cloneDeep(this.params.watchProperty ? pick(state, this.params.watchProperty) : state)
          return this.active ? this.params.comparator(this.head, this.previousKey) : false
        })
      ).subscribe(this.dirty$)

    // this.isDirty$.subscribe(dirty => this.store.patchState({dirty} as T))
  }

  setHead(): DirtyCheckQuery<T> {
    this.active = true
    this.head = this.previousKey
    this.dirty$.next(false)
    return this
  }

  reset(params: DirtyCheckParams = {}): void {
    const clean = params?.clean || this.params.clean

    this.isCleaning$.next(true)
    ;(clean ? clean(this.head, this.previousKey) : of(true)).subscribe({
      next: (result) => {
        this.setHead()
        this.isCleaning$.next(false)
      },
      error: (err) => {
        console.error(err)
        this.isCleaning$.next(false)
      },
    })
  }

  undo() {
    // this.steps.pop()
    // this.store.patchState(this.steps.pop() || {})
  }
}

// @internal
export function coerceArray<T>(value: T | T[]): T[] {
  if (!value) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}
