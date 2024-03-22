import { EventEmitter } from "@angular/core"
import { Observable, takeUntil, tap } from "rxjs"

export function createEventEmitter<T>(
  observable: Observable<T>,
  options?: {
    unsubscribe?: Observable<any>
    isAsync?: boolean
  }
): EventEmitter<T> {
  const { unsubscribe, isAsync } = options || {}

  const emitter = new EventEmitter<T>(isAsync === true)

  let obs = observable.pipe(tap((val) => emitter.next(val)))

  if (unsubscribe != null) {
    obs = obs.pipe(takeUntil(unsubscribe))
  }

  obs.subscribe()

  return emitter
}
