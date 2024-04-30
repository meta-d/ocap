import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { formatRelative } from 'date-fns'
import { map, switchMap } from 'rxjs/operators'
import { getDateLocale } from '../../../@core'
import { Store, VisitsService } from '../../../@core/services'

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  selector: 'pac-feed-recents',
  templateUrl: 'recents.component.html',
  styleUrls: ['recents.component.scss']
})
export class RecentsComponent {
  private store = inject(Store)
  private visitsService = inject(VisitsService)
  private translateService = inject(TranslateService)

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
}
