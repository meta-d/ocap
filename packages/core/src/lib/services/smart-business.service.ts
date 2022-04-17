import { catchError, EMPTY, Observable, of, shareReplay, switchMap } from 'rxjs'
import { PresentationVariant, SelectionVariant } from '../annotations'
import { ServiceInit } from '../types'
import { EntityBusinessService, EntityBusinessState } from './entity.service'

export interface SmartBusinessState extends EntityBusinessState {
  selectionVariant?: SelectionVariant
  presentationVariant?: PresentationVariant
}

export class SmartBusinessService<T, State extends SmartBusinessState = SmartBusinessState>
  extends EntityBusinessService<T, State>
  implements ServiceInit
{
  private serviceInit$ = this.initialise$.pipe(
    switchMap(() =>
      this.onInit().pipe(
        catchError((err, caught) => {
          console.error(err)
          return EMPTY
        })
      )
    ),
    shareReplay(1)
  )

  onInit(): Observable<any> {
    return of(true)
  }
  onAfterServiceInit(): Observable<void> {
    return this.serviceInit$
  }
}
