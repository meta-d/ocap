import { CommonModule } from '@angular/common'
import { Component, Input, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { RouterModule } from '@angular/router'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { isArray } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { sortBy } from 'lodash-es'
import { BehaviorSubject, debounceTime, distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs'
import { FeedsService, VisitsService } from '../../@core'
import { MaterialModule } from '../material.module'


@Component({
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule, TranslateModule, OcapCoreModule],
  selector: 'pac-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  host: {
    class: 'pac-assets'
  }
})
export class AssetsComponent {
  private feedsService = inject(FeedsService)
  private visitsService = inject(VisitsService)

  @Input() get search() {
    return this.search$.value
  }
  set search(value) {
    this.search$.next(value)
  }
  private search$ = new BehaviorSubject<string>('')

  searchAssetsType = 'story'

  searching$ = new BehaviorSubject<boolean>(false)
  public readonly searchAssets$ = this.search$.pipe(
    distinctUntilChanged(),
    debounceTime(500),
    switchMap((text) => {
      text = text?.trim().toLowerCase()
      this.searching$.next(true)
      return text ? this.feedsService.search(text) : this.visitsService.myRecent()
    }),
    map((searchAssets) => {
      this.searching$.next(false)
      if (isArray(searchAssets)) {
        return searchAssets
          .map((item: any /*IVisit*/) => {
            if (item.story) {
              return { ...item.story, type: 'story' }
            } else if (item.model) {
              return { ...item.model, type: 'semanticModel' }
            } else if (item.indicator) {
              return { ...item.indicator, type: 'indicator' }
            }
            return null
          })
          .filter(Boolean)
      }

      if (searchAssets) {
        return sortBy(
          [
            ...searchAssets.story.items.map((item) => ({ ...item, type: 'story' })),
            ...searchAssets.semanticModel.items.map((item) => ({ ...item, type: 'semanticModel' })),
            ...searchAssets.indicator.items.map((item) => ({ ...item, type: 'indicator' }))
          ],
          'updatedAt'
        )
          .reverse()
          .slice(0, 20)
      }

      return searchAssets
    }),
    takeUntilDestroyed(),
    shareReplay(1)
  )

  public readonly isEmpty$ = this.searchAssets$.pipe(map((searchAssets) => !searchAssets?.length))
}
