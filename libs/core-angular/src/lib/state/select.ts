import { isNil } from 'lodash-es'
import { BehaviorSubject } from 'rxjs'
import { filter, switchMap } from 'rxjs/operators'

function Stateful1<T extends { new (...args: any[]): any }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args)
      console.warn(args[super.__storeName__])
      super.__store__.next(args[super.__storeName__])
    }
  }
}

export function Select1<T>(rawSelector?: T, ...paths: string[]): PropertyDecorator {
  return function (target: any, key): void {
    const name: string = key.toString()
    const selectorId = `__${name}__selector`
    // const selector = createSelectorFn(name, rawSelector, paths);

    target.__store__ = target.__store__ || new BehaviorSubject(null)

    Object.defineProperties(target, {
      [selectorId]: {
        writable: true,
        enumerable: false,
        configurable: true,
      },
      [name]: {
        enumerable: true,
        configurable: true,
        get(): T {
          return (
            this[selectorId] ||
            (this[selectorId] = target.__store__.pipe(
              filter((store) => !isNil(store)),
              switchMap((store: any) => store.select())
            ))
          )
        },
      },
    })
  }
}

export function Store1<T>() {
  return function (target?: any, propertyName?: string, des?: any): void {
    // const name: string = propertyName.toString();
    target.prototype.__storeName__ = des
  }
}

export function Action1(action: any) {
  return function (target?: any, propertyName?: string, des?: any): void {
    // const name: string = propertyName.toString();
    target.prototype.__storeName__ = des
  }
}
