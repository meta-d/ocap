import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostBinding,
  inject,
  Inject,
  LOCALE_ID,
  ViewChild,
  ViewContainerRef
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormControl } from '@angular/forms'
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet'
import { MatDatepicker } from '@angular/material/datepicker'
import { Router } from '@angular/router'
import { Store } from '@metad/cloud/state'
import { LanguagesEnum } from '@metad/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { TimeGranularity } from '@metad/ocap-core'
import { ComponentStore } from '@metad/store'
import { includes, some } from 'lodash-es'
import { injectQueryParams } from 'ngxtension/inject-query-params'
import { NgxPopperjsPlacements, NgxPopperjsTriggers } from 'ngx-popperjs'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap, tap } from 'rxjs/operators'
import { IndicatorDetailComponent } from './indicator-detail/indicator-detail.component'
import { MyDataSource } from './services/data-source'
import { IndicatorsStore } from './services/store'
import { IndicatorState, IndicatorTagEnum, LookbackLimit } from './types'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-indicator-market',
  templateUrl: 'indicator-market.component.html',
  styleUrls: [`indicator-market.component.scss`],
  providers: [IndicatorsStore]
})
export class IndicatoryMarketComponent extends ComponentStore<{ id?: string }> {
  TIME_GRANULARITY = TimeGranularity
  NgxPopperjsTriggers = NgxPopperjsTriggers
  NgxPopperjsPlacements = NgxPopperjsPlacements
  IndicatorTagEnum = IndicatorTagEnum

  readonly router = inject(Router)

  @HostBinding('class.indicator-market-app') isIndicatoryMarketComponent = true
  @HostBinding('class.searching') searching = false

  @ViewChild('searchInput') searchInputRef: ElementRef

  readonly tagType = this.indicatorsStore.tagType

  indicatorDataSource: MyDataSource // = new MyDataSource(this.indicatorsStore)
  readonly mediaMatcher$ = combineLatest(
    Object.keys(Breakpoints).map((name) => {
      return this.breakpointObserver
        .observe([Breakpoints[name]])
        .pipe(map((state: BreakpointState) => [name, state.matches]))
    })
  ).pipe(map((breakpoints) => breakpoints.filter((item) => item[1]).map((item) => item[0])))
  public readonly isMobile$ = this.mediaMatcher$.pipe(
    map((values) => some(['XSmall', 'Small', 'HandsetPortrait'], (el) => includes(values, el))),
    distinctUntilChanged(),
    shareReplay(1)
  )

  public readonly notMobile$ = this.isMobile$.pipe(map((result) => !result))
  readonly selected$ = this.indicatorsStore.currentIndicator
  readonly currentIndicatorIds$ = computed(() => [this.indicatorsStore.currentIndicator()])

  isShowModal = false
  private _bottomSheetRef: MatBottomSheetRef
  // timeGranularity = TimeGranularity.Month
  // lookback = 12
  _currentDate = new Date()
  dateControl = new FormControl<Date>(this._currentDate)

  readonly queryParams = injectQueryParams()

  readonly timeGranularity = this.indicatorsStore.timeGranularity
  readonly lookBack = this.indicatorsStore.lookback
  readonly lookbackLimit = computed(() => {
    return LookbackLimit[this.timeGranularity()] ?? 100
  })

  /**
   * Subscriptions
   */
  private _orgSub = this.store
    .selectOrganizationId()
    .pipe(takeUntilDestroyed())
    .subscribe((id) => {
      this.indicatorsStore.init()
      this.onLookback(this.lookBack())
      this.indicatorDataSource = new MyDataSource(this.indicatorsStore)
    })

  constructor(
    private store: Store,
    private indicatorsStore: IndicatorsStore,
    private dsCoreService: NgmDSCoreService,
    private breakpointObserver: BreakpointObserver,
    @Inject(LOCALE_ID)
    private locale: string,
    private _bottomSheet: MatBottomSheet,
    private _viewContainerRef: ViewContainerRef
  ) {
    super({})
    // TODO 演示时间
    this.dsCoreService.setToday(this._currentDate)
    this.onLookback(this.lookBack())

    this.dateControl.valueChanges.subscribe((value) => {
      this.dsCoreService.setToday(value)
      this.indicatorsStore.resetData()
    })

    this.indicatorsStore.locale = this.locale

    effect(() => {
      if (!this.indicatorsStore.currentIndicator()) {
        if (this.queryParams()?.id) {
          this.indicatorsStore.currentIndicator.set(this.queryParams().id)
        } else if (this.indicatorsStore.firstIndicator()) {
          this.indicatorsStore.currentIndicator.set(this.indicatorsStore.firstIndicator().id)
        }
      }
    }, { allowSignalWrites: true })

    effect(() => {
      this.dsCoreService.setTimeGranularity(this.timeGranularity())
    })
  }

  readonly openModal = this.effect((origin$: Observable<string>) => {
    return origin$.pipe(
      switchMap((id) => {
        return this.isMobile$.pipe(
          tap((isMobile) => {
            if (isMobile && id) {
              this._bottomSheetRef = this._bottomSheet.open(IndicatorDetailComponent, {
                panelClass: ['pac-indicator-market__detail-container'],
                viewContainerRef: this._viewContainerRef,
                data: { id }
              })
            } else {
              this._bottomSheetRef?.dismiss()
            }
          })
        )
      })
    )
  })

  trackBy(index: number, el) {
    return el
  }

  onSearch(event) {
    this.indicatorsStore.search((<string>event.target.value)?.toLowerCase())
  }

  trackById(index, el) {
    return el.id
  }

  prevDatesFilter = (d: Date | null): boolean => {
    return d <= new Date()
  }

  chosenYearHandler(event: Date | null, datepicker: MatDatepicker<any>) {
    if (this.timeGranularity() === TimeGranularity.Year) {
      this.dateControl.setValue(event)
      datepicker.close()
    }
  }

  chosenMonthHandler(event, datepicker: MatDatepicker<any>) {
    if (this.timeGranularity() === TimeGranularity.Month || this.timeGranularity() === TimeGranularity.Quarter) {
      this.dateControl.setValue(event)
      datepicker.close()
    }
  }

  click(item: IndicatorState) {
    this.indicatorsStore.currentIndicator.set(item.id)
    this.openModal(item.id)
    this.router.navigate([], {
      queryParams: { id: item.id },
      queryParamsHandling: 'merge'
    })
  }

  onTimeGranularity(event: TimeGranularity) {
    this.indicatorsStore.resetData()
    this.indicatorsStore.updateTimeGranularity(event)
  }

  onLookback(event: number) {
    this.indicatorsStore.updateLookback(event)
  }

  toggleTag(event) {
    this.indicatorsStore.toggleTag()
  }

  refresh() {
    // 强制刷新指标数据
    this.indicatorsStore.refresh(true)
  }

  onSearchFocus(event) {
    this.searching = true
  }
  onSearchDone() {
    this.searching = false
    this.indicatorsStore.search('')
    this.searchInputRef.nativeElement.value = ''
  }

  dropOrder(event: CdkDragDrop<IndicatorState[]>) {
    this.indicatorsStore.order(event)
  }

  @HostBinding('class.reverse-semantic-color')
  public get reverse() {
    return this.indicatorsStore.currentLang() === LanguagesEnum.SimplifiedChinese
  }
}
