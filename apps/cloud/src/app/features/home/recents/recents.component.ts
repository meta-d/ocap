import { Component } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { formatRelative } from 'date-fns'
import { map, switchMap } from 'rxjs/operators'
import { getDateLocale } from '../../../@core'
import { Store, VisitsService } from '../../../@core/services'

@Component({
  selector: 'pac-feed-recents',
  templateUrl: 'recents.component.html',
  styleUrls: ['recents.component.scss']
})
export class RecentsComponent {
  private organizationId$ = this.store.selectOrganizationId()

  public readonly recents$ = this.organizationId$.pipe(
    switchMap(() => this.visitsService.myRecent()),
    map((items) =>
      items.map((item) => ({
        ...item,
        updatedAt: formatRelative(new Date(item.updatedAt), new Date(), {
          locale: getDateLocale(this.translateService.currentLang)
        })
      }))
    )
  )

  constructor(private store: Store, private visitsService: VisitsService, private translateService: TranslateService) {}

}
