import { Injectable } from '@angular/core'
import { ComponentStore } from '@ngrx/component-store'
import { get, isArray, isEqual, isFunction, isString, matches } from 'lodash-es'
import { Observable, BehaviorSubject, combineLatest, merge } from 'rxjs'
import { distinctUntilChanged, filter, map, withLatestFrom } from 'rxjs/operators'


export interface SelectConfig {
  distinctDeeply?: boolean
}

export interface ComponentOptions<T> {
  // 最终结果
  options: T
  // 组件输入
  inputOptions: T
  // 内部改变
  innerOptions: T
  // 默认值
  defaultOptions: T
}

/**
 * 作为状态管理功能的初创原型
 * @deprecated 使用 ComponentStore
 */
@Injectable()
export class OptionsStore2<T> extends ComponentStore<ComponentOptions<T>> {

  /**
   * 组件输入和内部改变合集
   */
  private _options$ = new BehaviorSubject<T>({} as T)

  readonly inputOptions$ = this.select(state => state.inputOptions)
  readonly innerOptions$ = this.select(state => state.innerOptions)
  
  /**
   * 最终结果
   */
  readonly options$ = combineLatest([this._options$, this.select(state => state.defaultOptions)])
    .pipe(
      map(([options, defaults]) => ({
        ...defaults,
        ...options,
      }))
    )

  /**
   * 当内部改变时发出组件输入和内部改变的合集
   */
  public optionsChange = this.select(state => state.inputOptions).pipe(
    withLatestFrom(this._options$),
    map(([inner, options]) => options),
    filter((options) => !matches(options)({}))
  )

  constructor() {
    super({} as any)
    merge(this.inputOptions$, this.innerOptions$)
      .pipe(
        map((options) => {
          return {
            ...this._options$.value,
            ...options,
          }
        })
      )
      .subscribe(this._options$)
  }

  readonly input = this.updater((state, inputOptions: T) => ({
    ...state,
    inputOptions
  }))

  readonly patchInput = this.updater((state, options: T) => ({
    ...state,
    inputOptions: {
      ...state.inputOptions,
      ...options,
    }
  }))

  readonly patchOptions = this.updater((state, options: Partial<T>) => ({
    ...state,
    innerOptions: {
      ...state.innerOptions,
      ...options,
    }
  }))

  readonly patch = this.patchOptions

  readonly patchDefault = this.updater((state, options: T) => ({
    ...state,
    defaultOptions: {
      ...state.defaultOptions,
      ...options,
    }
  }))
}

/**
 * @deprecated 使用 ComponentStore
 */
@Injectable()
export class OptionsStore<T> {
  /**
   * 最终结果
   */
  private options$ = new BehaviorSubject<T>({} as T)
  /**
   * 组件输入
   */
  private _inputOptions$ = new BehaviorSubject<T>({} as T)
  /**
   * 内部改变
   */
  private _innerOptions$ = new BehaviorSubject<T>({} as T)
  /**
   * 组件输入和内部改变合集
   */
  private _options$ = new BehaviorSubject<T>({} as T)

  /**
   * 默认值
   */
  private _default$ = new BehaviorSubject<T>({} as T)

  /**
   * 当内部改变时发出组件输入和内部改变的合集
   */
  public optionsChange = this._innerOptions$.pipe(
    withLatestFrom(this._options$),
    map(([inner, options]) => options),
    filter((options) => !matches(options)({}))
  )

  constructor() {
    merge(this._inputOptions$, this._innerOptions$)
      .pipe(
        map((options) => {
          return {
            ...this._options$.value,
            ...options,
          }
        })
      )
      .subscribe(this._options$)

    combineLatest([this._options$, this._default$])
      .pipe(
        map(([options, defaults]) => ({
          ...defaults,
          ...options,
        }))
      )
      .subscribe(this.options$)
  }

  input(options) {
    this._inputOptions$.next(options)
  }

  patchOptions(value: Partial<T>) {
    this._innerOptions$.next({
      ...this._innerOptions$.value,
      ...value,
    })
  }

  patchInput(value: Partial<T>) {
    this._inputOptions$.next({
      ...this._inputOptions$.value,
      ...value,
    })
  }

  patch(value: Partial<T>) {
    this._innerOptions$.next({
      ...this._innerOptions$.value,
      ...value,
    })
  }

  patchDefault(value: Partial<T>) {
    this._default$.next({
      ...this._default$.value,
      ...value,
    })
  }

  get value(): T {
    return this.options$.value
  }

  get<P>(selector: (state: T) => P): P
  get<P>(selector: string): P
  get<P>(selector: any): P {
    const selectorFn = getSelectorFn<T, P>(selector)
    return selectorFn(this.value)
  }

  public selectInput<P>(selector?: any) {
    const selectorFn = getSelectorFn<T, P>(selector)
    return this._inputOptions$.pipe(map(selectorFn), distinctUntilChanged())
  }

  select<P>(selector: (state: T) => P, config?: SelectConfig): Observable<P>
  select<P>(selector: string, config?: SelectConfig): Observable<P>
  select<P>(config?: SelectConfig): Observable<P>
  select<P>(selector?: any, config?: SelectConfig): Observable<P> {
    const selectorFn = getSelectorFn<T, P>(selector)
    const distinctFun = config?.distinctDeeply ? distinctUntilChanged(isEqual) : distinctUntilChanged()
    return this.options$.pipe(map(selectorFn), distinctFun) as Observable<P>
  }
}

export function getSelectorFn<T, P>(selector?: any) {
  if (isFunction(selector)) {
    return selector
  } else if (isString(selector)) {
    return (state: T) => {
      return get(state, selector) as P
    }
  } else {
    return (state: T) => {
      return state
    }
  }
}

export function connect(store1, states?) {
  return (store2) => {
    if (isArray(states)) {
      states.forEach(state => {
        store1.select(state).subscribe(value => store2.patch({[state]: value}))
      })
    } else if(isString(states)) {
      store1.select(states).subscribe(value => store2.patch({[states]: value}))
    } else {
      store1.select().subscribe(value => store2.patch(value))
    }
  }
}
