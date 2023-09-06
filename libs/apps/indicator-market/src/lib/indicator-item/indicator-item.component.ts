import { Component, Input, inject } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { BehaviorSubject, distinctUntilChanged, EMPTY, filter, switchMap, tap } from 'rxjs'
import { IndicatorsStore } from '../services/store'
import { IndicatorState, StatisticalType, TagEnum, Trend } from '../types'
import { IndicatorItemDataService } from './indicator-item.service'

/**
 * 由于 cdk-virtual-scroll 原理 (待严格确定) 此组件不会随 indicator 变化而重新创建, 所以此组件的 indicator 输入会变化, 导致指标数据显示混乱
 * 
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'pac-indicator-item',
  templateUrl: 'indicator-item.component.html',
  styleUrls: ['indicator-item.component.scss'],
  providers: [ IndicatorItemDataService ]
})
export class IndicatorItemComponent {
  statisticalType: StatisticalType = StatisticalType.CurrentPeriod
  TagEnum = TagEnum
  TREND = Trend

  private readonly dataService = inject(IndicatorItemDataService)
  private readonly store = inject(IndicatorsStore)

  @Input() get indicator(): IndicatorState {
    return this.indicator$.value
  }
  set indicator(value) {
    this.indicator$.next(value)
  }
  public indicator$ = new BehaviorSubject(null)

  @Input() tag: TagEnum

  public readonly lookBack$ = this.store.lookBack$
  public readonly loading$ = this.dataService.loading$

  /**
   * Subscriptions
   */
  private lookBackSub = this.lookBack$
    .pipe(
      switchMap((lookBack) => {
        let initialized = false
        return this.indicator$.pipe(
          distinctUntilChanged(),
          switchMap((indicator) => {
            if (indicator?.dataSettings && (!indicator.initialized || !initialized)) {
              this.dataService.patchState({
                indicatorId: indicator.id,
                lookBack
              })
              
              this.dataService.dataSettings = indicator.dataSettings
              initialized = true

              return this.dataService.onAfterServiceInit().pipe(tap(() => this.dataService.refresh()))
            }

            return EMPTY
          }),
        )
      }),
    )
    .subscribe(() => {
      //
    })

  private _indicatorResultSub = this.dataService.selectResult()
    .pipe(filter((result: any) => result.indicator?.id && result.indicator?.id === this.indicator?.id))
    .subscribe((result: any) => {
      if (result?.error) {
        this.store.updateIndicator({
          id: result.indicator.id,
          changes: {
            initialized: true,
            loaded: true,
            error: result.error
          }
        })
      } else {
        this.store.updateIndicator({
          id: result.indicator.id,
          changes: {
            initialized: true,
            loaded: true,
            trends: result.trends,
            data: result.data,
            trend: result.trend,
            error: null
          }
        })
      }
    })

  open() {
    console.log('open')
  }

  close() {
    console.log('close')
  }

  toggleTag(event) {
    event.stopPropagation()
    event.preventDefault()

    this.store.toggleTag()
  }
  
}
