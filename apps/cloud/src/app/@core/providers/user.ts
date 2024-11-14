import { inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { Store } from '../services'

export function injectUser() {
  const store = inject(Store)
  return toSignal(store.user$)
}
