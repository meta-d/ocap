import { Component, computed, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { AbstractStoryWidget, StoryWidgetState, StoryWidgetStyling, WidgetMenuType, nonNullable } from '@metad/core'
import { TrendType, isNil } from '@metad/ocap-core'
import { ComponentStyling, componentStyling } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { distinctUntilChanged, filter, map } from 'rxjs/operators'
import { KeyPerformanceIndicatorService } from './key-performance-indicator.service'
import { NxWidgetKPIOptions } from './types'

export interface PacWidgetKPIStyling extends StoryWidgetStyling {
  title: ComponentStyling
  value: ComponentStyling
}

@Component({
  selector: 'pac-widget-kpi',
  templateUrl: 'kpi.component.html',
  styleUrls: ['kpi.component.scss'],
  providers: [KeyPerformanceIndicatorService]
})
export class NxWidgetKpiComponent extends AbstractStoryWidget<
  NxWidgetKPIOptions,
  StoryWidgetState<NxWidgetKPIOptions>,
  PacWidgetKPIStyling
> {
  TrendType = TrendType

  public readonly dataService = inject(KeyPerformanceIndicatorService)
  readonly #logger = inject(NGXLogger)

  get intent() {
    return this.options?.intent
  }

  public readonly placeholder$ = this.dataSettings$.pipe(
    map((dataSettings) => !(dataSettings?.dataSource && dataSettings?.entitySet))
  )

  public readonly kpiValue$ = this.dataService.kpiValue$
  public readonly trend$ = this.dataService.kpiValue$.pipe(filter((kpiValue) => !isNil(kpiValue.arrow)))
  public readonly additionalDataPoints$ = this.dataService.additionalDataPoints$.pipe(
    map((kpiValues) =>
      kpiValues.map((kpiValue) => {
        switch (this.options?.additionalDataPoint?.value) {
          case 'Value':
            break
          case 'TargetValue':
            kpiValue.value = kpiValue.targetValue
            break
          case 'ForecastValue':
            // 暂不支持 ForecastValue
            break
          case 'ReferenceValue':
            kpiValue.value = kpiValue.referenceValue
            kpiValue.unit = kpiValue.referenceValueUnit
            break
          case 'Deviation':
            kpiValue.value = kpiValue.deviation
            kpiValue.unit = '%'
            break
        }
        return kpiValue
      })
    ),
    map((additionals) => (additionals.length > 0 ? additionals : null))
  )

  public readonly titleStyles$ = computed(() => componentStyling(this.styling$()?.title))
  
  readonly valueStyles = computed(() => componentStyling(this.styling$()?.value))

  public readonly isLoading$ = this.dataService.loading$
  public readonly error$ = this.dataService.selectResult().pipe(map(({ error }) => error))

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  // slicers
  private slicersSub = this.selectionVariant$.pipe(takeUntilDestroyed()).subscribe((selectionVariant) => {
    this.dataService.selectionVariant = selectionVariant
    this.refresh()
  })
  private _settingsSub = this.dataSettings$.pipe(distinctUntilChanged(), takeUntilDestroyed()).subscribe((value) => {
    this.dataService.dataSettings = value
  })
  private entityTypeSub = this.dataService
    .selectEntityType()
    .pipe(takeUntilDestroyed())
    .subscribe((entityType) => {
      this.entityType.set(entityType)
    })
  private _resultSub = this.dataService
    .selectResult()
    .pipe(takeUntilDestroyed())
    .subscribe((result) => {
      this.#logger.debug(`Result from dataService in NxWidgetKpiComponent is:`, result)
      this.setExplains([result, this.dataSettings])
    })

  private _serviceInitSub = this.dataService
    .onAfterServiceInit()
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.refresh()
    })

  private _optionsSub = this.options$
    .pipe(filter(nonNullable), distinctUntilChanged(), takeUntilDestroyed())
    .subscribe((value) => {
      this.dataService.options = value
    })

  refresh(force = false): void {
    this.dataService.refresh(force)
  }

  onClick(evt) {
    // const selectOptions = getSelectOptions(this.dataSettings)
    // const dataPoint = this.kpiService.getDataPoint()
    // if (selectOptions) {
    //   this.filterChange.emit([
    //     {
    //       filteringLogic: FilteringLogic.And,
    //       children: selectOptions
    //     } as IAdvancedFilter
    //   ])
    // }
  }

  onIntentClick() {
    if (this.intent) {
      this.coreService.sendIntent(this.intent)
    }
  }

  openDesigner() {
    this.widgetService?.clickMenu({
      key: 'open_designer',
      type: WidgetMenuType.Action
    })
  }
}
