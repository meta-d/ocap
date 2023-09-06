import { concatMap, delay, from, interval, of, startWith, switchMap } from 'rxjs'

export function createTimer() {
  return interval(12000).pipe(
    startWith(0),
    switchMap(() => {
      return from(['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛']).pipe(
        concatMap((val) => of(val).pipe(delay(1000)))
      )
    })
  )
}
