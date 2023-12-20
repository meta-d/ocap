import { isPlatformBrowser } from '@angular/common'
import { HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Inject, Injectable, PLATFORM_ID, DebugElement, EventEmitter } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { isNil, negate, isEqual, isEmpty, merge, isString, includes } from 'lodash-es'
import { Observable, Subject, Subscription, isObservable, of } from 'rxjs'
import { filter, takeUntil, tap } from 'rxjs/operators'

export const isNotNil = negate(isNil)
export const filterNil = filter(negate(isNil))
export const isNotEqual = negate(isEqual)
export const isNotEmpty = negate(isEmpty)

export function isBlank(value) {
  return isNil(value) || isString(value) && !value.trim()
}

/**
 *@hidden
 */
export function cloneArray(array: any[], deep?: boolean) {
  const arr = []
  if (!array) {
    return arr
  }
  let i = array.length
  while (i--) {
    arr[i] = deep ? cloneValue(array[i]) : array[i]
  }
  return arr
}

/**
 * Doesn't clone leaf items
 * @hidden
 */
export function cloneHierarchicalArray(array: any[], childDataKey: any): any[] {
  const result: any[] = []
  if (!array) {
    return result
  }

  for (const item of array) {
    const clonedItem = cloneValue(item)
    if (Array.isArray(item[childDataKey])) {
      clonedItem[childDataKey] = cloneHierarchicalArray(clonedItem[childDataKey], childDataKey)
    }
    result.push(clonedItem)
  }
  return result
}

/**
 * Deep clones all first level keys of Obj2 and merges them to Obj1
 * @param obj1 Object to merge into
 * @param obj2 Object to merge from
 * @returns Obj1 with merged cloned keys from Obj2
 * @hidden
 */
export function mergeObjects(obj1: {}, obj2: {}): any {
  if (!isObject(obj1)) {
    throw new Error(`Cannot merge into ${obj1}. First param must be an object.`)
  }

  if (!isObject(obj2)) {
    return obj1
  }

  for (const key of Object.keys(obj2)) {
    obj1[key] = cloneValue(obj2[key])
  }

  return obj1
}

/**
 * Creates deep clone of provided value.
 * Supports primitive values, dates and objects.
 * If passed value is array returns shallow copy of the array.
 * @param value value to clone
 * @returns Deep copy of provided value
 *@hidden
 */
export function cloneValue(value: any): any {
  if (isDate(value)) {
    return new Date(value.getTime())
  }
  if (Array.isArray(value)) {
    return [...value]
  }

  if (value instanceof Map || value instanceof Set) {
    return value
  }

  if (isObject(value)) {
    const result = {}

    for (const key of Object.keys(value)) {
      result[key] = cloneValue(value[key])
    }
    return result
  }
  return value
}

/**
 * Checks if provided variable is Object
 * @param value Value to check
 * @returns true if provided variable is Object
 *@hidden
 */
export function isObject(value: any): boolean {
  return value && value.toString() === '[object Object]'
}

/**
 * Checks if provided variable is Date
 * @param value Value to check
 * @returns true if provided variable is Date
 *@hidden
 */
export function isDate(value: any) {
  return Object.prototype.toString.call(value) === '[object Date]'
}

/**
 *@hidden
 */
export const enum KEYCODES {
  ENTER = 13,
  SPACE = 32,
  ESCAPE = 27,
  LEFT_ARROW = 37,
  UP_ARROW = 38,
  RIGHT_ARROW = 39,
  DOWN_ARROW = 40,
  F2 = 113,
  TAB = 9,
  CTRL = 17,
  Z = 90,
  Y = 89,
  X = 88,
  BACKSPACE = 8,
  DELETE = 46,
  INPUT_METHOD = 229,
}

/**
 *@hidden
 */
export const enum KEYS {
  ENTER = 'Enter',
  SPACE = ' ',
  SPACE_IE = 'Spacebar',
  ESCAPE = 'Escape',
  ESCAPE_IE = 'Esc',
  LEFT_ARROW = 'ArrowLeft',
  LEFT_ARROW_IE = 'Left',
  UP_ARROW = 'ArrowUp',
  UP_ARROW_IE = 'Up',
  RIGHT_ARROW = 'ArrowRight',
  RIGHT_ARROW_IE = 'Right',
  DOWN_ARROW = 'ArrowDown',
  DOWN_ARROW_IE = 'Down',
  F2 = 'F2',
  TAB = 'Tab',
  SEMICOLON = ';',
  HOME = 'Home',
  END = 'End'
}

/**
 *@hidden
 * Returns the actual size of the node content, using Range
 * ```typescript
 * let range = document.createRange();
 * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
 *
 * let size = getNodeSizeViaRange(range, column.cells[0].nativeElement);
 * ```
 */
export function getNodeSizeViaRange(range: Range, node: any): number {
  let overflow = null
  if (!isFirefox()) {
    overflow = node.style.overflow
    // we need that hack - otherwise content won't be measured correctly in IE/Edge
    node.style.overflow = 'visible'
  }

  range.selectNodeContents(node)
  const width = range.getBoundingClientRect().width

  if (!isFirefox()) {
    // we need that hack - otherwise content won't be measured correctly in IE/Edge
    node.style.overflow = overflow
  }

  return width
}
/**
 *@hidden
 * Returns the actual size of the node content, using Canvas
 * ```typescript
 * let ctx = document.createElement('canvas').getContext('2d');
 * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
 *
 * let size = valToPxlsUsingCanvas(ctx, column.cells[0].nativeElement);
 * ```
 */
// export function getNodeSizeViaCanvas(canvas2dCtx: any, node: any): number {
//   const s = this.grid.document.defaultView.getComputedStyle(node)

//   // need to set the font to get correct width
//   canvas2dCtx.font = s.fontSize + ' ' + s.fontFamily

//   return canvas2dCtx.measureText(node.textContent).width
// }

/**
 *@hidden
 */
export function isIE(): boolean {
  return navigator.appVersion.indexOf('Trident/') > 0
}
/**
 *@hidden
 */
export function isEdge(): boolean {
  const edgeBrowser = /Edge[\/\s](\d+\.\d+)/.test(navigator.userAgent)
  return edgeBrowser
}

/**
 *@hidden
 */
export function isFirefox(): boolean {
  const firefoxBrowser = /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)
  return firefoxBrowser
}

/**
 * @hidden
 */
@Injectable({ providedIn: 'root' })
export class PlatformUtil {
  public isBrowser: boolean = isPlatformBrowser(this.platformId)

  public isIOS =
    this.isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
}

/**
 * @hidden
 */
export function isLeftClick(event: PointerEvent) {
  return event.button === 0
}

/** @hidden */
export function isNavigationKey(key: string): boolean {
  return (
    [
      'down',
      'up',
      'left',
      'right',
      'arrowdown',
      'arrowup',
      'arrowleft',
      'arrowright',
      'home',
      'end',
      'space',
      'spacebar',
      ' ',
    ].indexOf(key) !== -1
  )
}

export const NAVIGATION_KEYS = new Set([
  'down',
  'up',
  'left',
  'right',
  'arrowdown',
  'arrowup',
  'arrowleft',
  'arrowright',
  'home',
  'end',
  'space',
  'spacebar',
  ' ',
])
export const ROW_EXPAND_KEYS = new Set('right down arrowright arrowdown'.split(' '))
export const ROW_COLLAPSE_KEYS = new Set('left up arrowleft arrowup'.split(' '))
export const SUPPORTED_KEYS = new Set([
  ...Array.from(NAVIGATION_KEYS),
  'tab',
  'enter',
  'f2',
  'escape',
  'esc',
])

/**
 * @hidden
 * @internal
 *
 * Creates a new ResizeObserver on `target` and returns it as an Observable.
 * Run the resizeObservable outside angular zone, because it patches the MutationObserver which causes an infinite loop.
 * Related issue: https://github.com/angular/angular/issues/31712
 */
export function resizeObservable(target: HTMLElement): Observable<ResizeObserverEntry[]> {
  return new Observable((observer) => {
    const instance = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      observer.next(entries)
    })
    instance.observe(target)
    const unsubscribe = () => instance.disconnect()
    return unsubscribe
  })
}

export function convertToBoolProperty(val: any): boolean {
  if (typeof val === 'string') {
    val = val.toLowerCase().trim()

    return val === 'true' || val === ''
  }

  return !!val
}

/** Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler */
export const ButtonClickEvents = {
  left: { button: 0 },
  right: { button: 2 },
}

/** Simulate element click. Defaults to mouse left-button click event. */
export function click(
  el: DebugElement | HTMLElement,
  eventObj: any = ButtonClickEvents.left
): void {
  if (el instanceof HTMLElement) {
    el.click()
  } else {
    el.triggerEventHandler('click', eventObj)
  }
}

export function makeid(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const characters = chars + '0123456789'
  const charactersLength = characters.length
  // 首字母为英文字符
  let result = chars.charAt(Math.floor(Math.random() * chars.length))
  for (let i = 0; i < length - 1; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const mkenum = <T extends { [index: string]: U }, U extends string>(x: T) => x;


// Search options
export function includeIgnoreCase(text, target) {
  const keywords: Array<string> = target.split(/\s+/g)
  const matchs = String(text).match(new RegExp(`(${keywords.join('|')})`, 'ig'))
  return matchs
}

/**
 * 分解高亮字符串
 * 
 * @param text 
 * @param highlight 
 * @returns 
 */
export function splitByHighlight(text, highlight): Array<{value: string, match?: boolean}> {
  if (highlight && text) {
    const keywords: Array<string> = highlight.split(/\s+/g)
    const matchs = String(text).match(new RegExp(`(${keywords.join('|')})`, 'ig'))
    const results = String(text).split(new RegExp(`(${keywords.join('|')})`, 'i'))
    if (results?.length > 1) {
      return results.map(value => includes(matchs, value) ? {match: true, value} : {value})
    }
  }

  return [{value: text}]
}

export function toParams(query) {
	let params: HttpParams = new HttpParams();
	Object.keys(query).forEach((key) => {
		if (isJsObject(query[key])) {
			params = toSubParams(params, key, query[key]);
		} else {
			params = params.append(key.toString(), query[key]);
		}
	});
	return params;
}


function isJsObject(object: any) {
	return (
		object !== null && object !== undefined && typeof object === 'object'
	);
}

function toSubParams(params: HttpParams, key: string, object: any) {
	Object.keys(object).forEach((childKey) => {
		if (isJsObject(object[childKey])) {
			params = toSubParams(
				params,
				`${key}[${childKey}]`,
				object[childKey]
			);
		} else {
			params = params.append(`${key}[${childKey}]`, object[childKey]);
		}
	});

	return params;
}



export function createEventEmitter<T>(
  observable: Observable<T>,
  options?: {
    unsubscribe?: Observable<any>;
    isAsync?: boolean;
  },
): EventEmitter<T> {
  const { unsubscribe, isAsync } = options || {};

  const emitter = new EventEmitter<T>(isAsync === true);

  let obs = observable.pipe(tap(val => emitter.next(val)));

  if (unsubscribe != null) {
    obs = obs.pipe(takeUntil(unsubscribe));
  }

  obs.subscribe();

  return emitter;
}

export function mergeOptions(obj1: unknown, ...objs: unknown[]) {
  return merge(obj1, ...objs.map(item => omitBlank(item)))
}

export function omitBlank(obj) {
  if (Array.isArray(obj)) {
    return obj.map(value => omitBlank(value))
  } else if (typeof obj === "object") {
    return Object.entries(obj)
      .filter(([, v]) => !isBlank(v))
      .reduce((r, [key, value]) => ({ ...r, [key]: omitBlank(value) }), {})
  }
  else {
    return obj
  }
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
export function effectAction<
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
    const _destroyed$ = takeUntilDestroyed()
  const origin$ = new Subject<ObservableType>();
  generator(origin$ as OriginType)
    // tied to the lifecycle 👇 of ComponentStore
    .pipe(_destroyed$)
    .subscribe();

  return (((
    observableOrValue?: ObservableType | Observable<ObservableType>
  ): Subscription => {
    const observable$ = isObservable(observableOrValue)
      ? observableOrValue
      : of(observableOrValue);
    return observable$.pipe(_destroyed$).subscribe((value) => {
      // any new 👇 value is pushed into a stream
      origin$.next(value as any);
    });
  }) as unknown) as ReturnType;
}

/**
 * Try get error message from any error object
 */
export function getErrorMessage(err: any): string {
  let error: string
  if (typeof err === 'string') {
    error = err
  } else if (err instanceof HttpErrorResponse) {
    error = err?.error?.message ?? err.message
  } else if (err instanceof Error) {
    error = err?.message
  } else if (err?.error instanceof Error) {
    error = err?.error?.message
  } else if (err) {
    // 实在没办法则转成 JSON string
    error = JSON.stringify(err)
  }

  return error
}
