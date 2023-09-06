import { Component } from '@angular/core'
import { BehaviorSubject, combineLatest, distinctUntilChanged, switchMap } from 'rxjs'
import { Store, VisitsService } from '../../../@core/services'

@Component({
  selector: 'pac-feed-user-visit',
  templateUrl: 'user-visit.component.html',
  styleUrls: ['user-visit.component.scss']
})
export class UserVisitComponent {
  get type() {
    return this.type$.value
  }
  set type(value) {
    this.type$.next(value)
  }
  private type$ = new BehaviorSubject<'all' | 'my'>('all')

  private organizationId$ = this.store.selectOrganizationId()

  public readonly ranking$ = combineLatest([
    this.organizationId$,
    this.type$.pipe(distinctUntilChanged())
  ]).pipe(
    switchMap(([, owner]) => this.visitsService.ranking('Story', owner))
  )

  constructor(private store: Store, private visitsService: VisitsService) {}
}
