import { ChangeDetectorRef, Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core'
import { FormControl } from '@angular/forms'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { TimeGranularity } from '@metad/ocap-core'
import { IndicatorsService, ModelsService, Store, StoriesService } from '@metad/cloud/state'
import { getErrorMessage } from '@metad/core'
import { GridType, GridsterComponent, GridsterConfig, GridsterItem } from 'angular-gridster2'
import { cloneDeep, compact, isEqual, pick } from 'lodash-es'
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  firstValueFrom,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  timer
} from 'rxjs'
import {
  AbilityActions,
  FeedsService,
  OrganizationDemoNetworkEnum,
  OrganizationsService,
  PermissionsEnum,
  ROUTE_ANIMATIONS_ELEMENTS,
  ToastrService
} from '../../../@core'
import { createTimer, TranslationBaseComponent } from '../../../@shared'

const QuickGuidesInit = {
  sample: {
    complete: false
  },
  model: {
    complete: false,
    quantity: 0
  },
  story: {
    complete: false,
    quantity: 0
  },
  indicator: {
    complete: false,
    quantity: 0
  }
}

@Component({
  selector: 'pac-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends TranslationBaseComponent implements OnInit {
  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS
  AbilityActions = AbilityActions

  private store = inject(Store)
  private feedsService = inject(FeedsService)
  private modelsService = inject(ModelsService)
  private storiesService = inject(StoriesService)
  private indicatorsService = inject(IndicatorsService)
  private organizationsService = inject(OrganizationsService)
  private dsCoreService = inject(NgmDSCoreService)
  private toastrService = inject(ToastrService)
  private readonly _cdr = inject(ChangeDetectorRef)

  @ViewChild(GridsterComponent) gridster: GridsterComponent

  searchControl = new FormControl<string>('')
  searching$ = new BehaviorSubject<boolean>(false)
  searchAssets = null
  searchAssetsType = 'story'

  editable = false
  options: GridsterConfig = {
    gridType: GridType.Fixed,
    setGridSize: true,
    fixedColWidth: 95,
    fixedRowHeight: 95,
    minCols: 9,
    minRows: 6,
    maxCols: 9,
    outerMargin: false,
    draggable: {
      enabled: false
    },
    resizable: {
      enabled: false
    },
    // displayGrid: 'always'
  }

  readonly quickGuides = signal(cloneDeep(QuickGuidesInit))
  showTrending = false
  creatingDemo = false

  public readonly user$ = this.store.user$
  public readonly organization$ = this.store.selectedOrganization$
  public readonly createdDemo$ = this.organization$.pipe(map((organization) => organization?.createdDemo))

  readonly pristineFeeds = signal([])
  readonly #feeds = signal([])
  readonly feeds = computed(() => compact(this.#feeds()).filter((item) => !item?.hidden))
  readonly dirty = computed(() => !isEqual(this.#feeds(), this.pristineFeeds()))

  public readonly searchAssets$ = this.searchControl.valueChanges.pipe(
    debounceTime(500),
    startWith(null),
    switchMap((text) => {
      text = text?.trim().toLowerCase()
      this.searching$.next(true)
      return text ? this.feedsService.search(text) : of(null)
    }),
    map((searchAssets) => {
      this.searching$.next(false)
      if (searchAssets) {
        searchAssets.empty =
          !searchAssets.story.total && !searchAssets.indicator.total && !searchAssets.semanticModel.total
        if (!searchAssets.empty) {
          if (!this.searchAssetsType || !searchAssets[this.searchAssetsType].total) {
            this.searchAssetsType = Object.keys(searchAssets).find((key) => searchAssets[key].total)
          }
        }
      }

      return searchAssets
    }),
    shareReplay(1)
  )

  public timer$ = createTimer()

  dateControl = new FormControl<Date>(new Date())

  public readonly demoPermission$ = this.store.userRolePermissions$.pipe(
    map((rolePermissions) => {
      return !!rolePermissions.find(
        (rolePermission) => rolePermission.permission === PermissionsEnum.ORG_DEMO_EDIT && rolePermission.enabled
      )
    })
  )

  private refreshAssets$ = new BehaviorSubject<void>(null)

  private feedsSub = this.feedsService
    .getAll()
    .pipe(
      map((items) => {
        const recents = items.find((item) => item.type === 'UserVisits')
        if (!recents) {
          items.splice(0, 0, {
            type: 'UserVisits'
          })
        }

        const userVisits = items.find((item) => item.type === 'Recents')
        if (!userVisits) {
          items.splice(0, 0, {
            type: 'Recents'
          })
        }

        // const guidesIndex = items.findIndex((item) => item.type === 'QuickGuides')
        // if (guidesIndex > -1) {
        //   this.quickGuides = items[guidesIndex]
        //   items.splice(guidesIndex, 1)
        // } else {
        //   this.quickGuides = cloneDeep(QuickGuidesInit)
        // }

        return items.map((item) => ({
          ...item,
          options: {
            ...(item.options ?? {}),
            position: item.options?.position ?? {
              rows: 3,
              cols: 3
            }
          }
        }))
      }),
      takeUntilDestroyed()
    )
    .subscribe(async (feeds) => {
      this.pristineFeeds.set(cloneDeep(feeds))
      this.#feeds.set(feeds)
    })
  private assetsSub = combineLatest([this.refreshAssets$, this.store.selectOrganizationId()])
    .pipe(
      switchMap(() =>
        combineLatest([this.modelsService.count(), this.storiesService.count(), this.indicatorsService.count()])
      ),
      takeUntilDestroyed()
    )
    .subscribe(([modelCount, storyCount, indicatorCount]) => {
      this.quickGuides.update((quickGuides) => {
        quickGuides.model.quantity = modelCount
        quickGuides.model.complete = modelCount > 0
  
        quickGuides.story.quantity = storyCount
        quickGuides.story.complete = storyCount > 0
  
        quickGuides.indicator.quantity = indicatorCount
        quickGuides.indicator.complete = indicatorCount > 0
        return quickGuides
      })
    })
  private dateSub = this.dateControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
    this.dsCoreService.setToday(value)
  })

  private demoSub = this.createdDemo$.pipe(takeUntilDestroyed()).subscribe((createdDemo) => {
    this.quickGuides.update((quickGuides) => {
      quickGuides.sample.complete = createdDemo
      return quickGuides
    })
  })

  ngOnInit(): void {
    this.dsCoreService.setTimeGranularity(TimeGranularity.Day)
  }

  trackById(index: number, item: any) {
    return item.id
  }

  async createOrgDemo() {
    if (this.creatingDemo) {
      return
    }
    this.creatingDemo = true
    try {
      await firstValueFrom(this.organizationsService.demo(this.store.organizationId, {
        source: OrganizationDemoNetworkEnum.aliyun
      }))
      this.toastrService.success('PAC.MENU.HOME.GenerateSamples', { Default: 'Generate samples' })
      this.quickGuides.update((quickGuides) => {
        quickGuides.sample.complete = true
        return quickGuides
      })
      this.store.selectedOrganization = {
        ...this.store.selectedOrganization,
        createdDemo: true
      }
      // Refresh assets count
      this.refreshAssets$.next()
    } catch (err) {
      this.toastrService.error(getErrorMessage(err))
    } finally {
      this.creatingDemo = false
      this._cdr.detectChanges()
    }
  }

  toggleEdit() {
    this.editable = !this.editable
    this.options = {
      ...this.options,
      draggable: {
        ...this.options.draggable,
        enabled: this.editable
      },
      resizable: {
        ...this.options.resizable,
        enabled: this.editable
      }
    }

    this.pristineFeeds.set(cloneDeep(this.#feeds()))
  }

  removeWidget(feed) {
    timer(100).subscribe(() => {
      this.#feeds.update((feeds) => {
        const index = feeds.indexOf(feed)
        if (index > -1) {
          feeds.splice(index, 1, null)
        }
        return [...feeds]
      })
    })
  }

  undoEdit() {
    this.#feeds.set(cloneDeep(this.pristineFeeds()))
  }

  restore() {
    this.undoEdit()
    this.#feeds.update((feeds) => feeds.map((item) => ({
      ...item,
      hidden: false,
      options: {
        ...(item.options ?? {}),
        position: {
          rows: 3,
          cols: 3
        }
      }
    })))
  }

  async commitEdit() {
    let updated = false
    for (const [key, pristineFeed] of this.pristineFeeds().entries()) {
      if (this.#feeds()[key]) {
        if (!isEqual(pristineFeed, this.#feeds()[key])) {
          if (this.#feeds()[key].id) {
            await firstValueFrom(
              this.feedsService.update(this.#feeds()[key].id, pick(this.#feeds()[key], ['hidden', 'options']))
            )
          } else {
            const result = await firstValueFrom(
              this.feedsService.create({
                ...this.#feeds()[key]
              })
            )
            this.#feeds().splice(key, 1, result)
          }
          updated = true
        }
      } else {
        updated = true
        if (pristineFeed.type === 'StoryWidget') {
          await firstValueFrom(this.feedsService.delete(pristineFeed.id))
        } else {
          await (pristineFeed.id
            ? firstValueFrom(this.feedsService.update(pristineFeed.id, { hidden: true }))
            : firstValueFrom(
                this.feedsService.create({
                  ...pristineFeed,
                  hidden: true
                })
              ))
        }
      }
    }

    if (updated) {
      this.toastrService.success('PAC.MENU.HOME.UpdateLayout', { Default: 'Update layout' })
      this.#feeds.update((feeds) => compact(feeds))
    }

    this.toggleEdit()
  }

  onGridsterItemChange({ item }: { item: GridsterItem }, feed: any) {
    // this.feeds = this.feeds
  }

  onIntersection(event) {
    // if (event[0].isIntersecting) {
    //   this.showTrending = true
    // }
  }
}
