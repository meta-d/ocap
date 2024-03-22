import { Observable } from "rxjs"

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