import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { AbstractStoryWidget, StoryWidgetState, StoryWidgetStyling, WidgetMenuType, nonNullable } from '@metad/core'
import { NgmObjectNumberComponent } from '@metad/ocap-angular/common'
import { TrendType, assignDeepOmitBlank, isEmpty, isEqual, isNil } from '@metad/ocap-core'
import { ComponentStyling, componentStyling, NxStoryService } from '@metad/story/core'
import { TranslateModule } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { distinctUntilChanged, filter, map } from 'rxjs/operators'
import { KeyPerformanceIndicatorService } from './key-performance-indicator.service'
import { KPIPlaceholderComponent } from './placeholder/placeholder.component'
import { NxWidgetKPIOptions } from './types'
import { MatMenuModule } from '@angular/material/menu'
import { MatButtonModule } from '@angular/material/button'
import { NgmSelectionModule, SlicersCapacity } from '@metad/ocap-angular/selection'
import { MatTooltipModule } from '@angular/material/tooltip'

export interface PacWidgetKPIStyling extends StoryWidgetStyling {
  title: ComponentStyling
  value: ComponentStyling
}

@Component({
  standalone: true,
  selector: 'pac-widget-kpi',
  templateUrl: 'kpi.component.html',
  styleUrls: ['kpi.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [KeyPerformanceIndicatorService],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,

    NgmObjectNumberComponent,
    KPIPlaceholderComponent,
    NgmSelectionModule
  ]
})
export class NxWidgetKpiComponent extends AbstractStoryWidget<
  NxWidgetKPIOptions,
  StoryWidgetState<NxWidgetKPIOptions>,
  PacWidgetKPIStyling
> {
  TrendType = TrendType
  SlicersCapacity = SlicersCapacity

  readonly dataService = inject(KeyPerformanceIndicatorService)
  readonly storyService = inject(NxStoryService, { optional: true })
  readonly #logger = inject(NGXLogger)


  readonly intent = computed(() => this.optionsSignal()?.intent)
  readonly showPlaceholder = computed(() => !(this.dataSettingsSignal()?.dataSource && this.dataSettingsSignal()?.entitySet))
  readonly showToolbar = computed(() => this.optionsSignal()?.showToolbar)
  readonly hasSlicers$ = this.selectOptions$.pipe(map((selectOptions) => !isEmpty(selectOptions)))

  public readonly kpiValue$ = this.dataService.kpiValue$
  public readonly trend$ = this.kpiValue$.pipe(filter((kpiValue) => !isNil(kpiValue?.arrow)))
  public readonly additionalDataPoints$ = this.dataService.additionalDataPoints$.pipe(
    map((kpiValues) =>
      kpiValues?.map((kpiValue) => {
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
    map((additionals) => (additionals?.length > 0 ? additionals : null))
  )

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly isLoading = toSignal(this.dataService.loading$)
  readonly error = signal<string | null>(null)
  readonly kpiStyles = computed(() => this.storyService?.storyOptions()?.preferences?.kpi, { equal: isEqual})
  readonly titleStyling = computed(() => {
    let result = null
    if (this.kpiStyles()?.title) {
      result = assignDeepOmitBlank({}, this.kpiStyles()?.title, 2)
    }
    if (this.styling$()?.title) {
      result = assignDeepOmitBlank(result || {}, this.styling$()?.title, 2)
    }
    return result
  })
  readonly valueStyling = computed(() => {
    let result = null
    if (this.kpiStyles()?.value) {
      result = assignDeepOmitBlank({}, this.kpiStyles()?.value, 2)
    }
    if (this.styling$()?.value) {
      result = assignDeepOmitBlank(result || {}, this.styling$()?.value, 2)
    }
    return result
  })
  readonly titleStyles$ = computed(() => this.titleStyling() ? componentStyling(this.titleStyling()) : null)
  readonly valueStyles = computed(() => this.valueStyling() ? componentStyling(this.valueStyling()) : null)

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private errorSub = this.dataService.selectResult().pipe(map(({ error }) => error), takeUntilDestroyed()).subscribe((err) => {
    this.error.set(err)
  })
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
      // this.#logger.debug(`Result from dataService in NxWidgetKpiComponent is:`, result)
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
    this.error.set(null)
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
    if (this.intent()) {
      this.coreService.sendIntent(this.intent())
    }
  }

  openDesigner() {
    this.widgetService?.clickMenu({
      key: 'open_designer',
      type: WidgetMenuType.Action
    })
  }
}
