import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { MetadDSCoreService } from '@metad/ocap-angular/core'
import { ChartBusinessService, ChartOptions, ChartSettings, DataSettings } from '@metad/ocap-core'
import { SmartEChartEngine } from '@metad/ocap-echarts'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { BehaviorSubject } from 'rxjs'
import { filter, map, switchMap, tap } from 'rxjs/operators'

@UntilDestroy()
@Component({
  selector: 'metad-analytical-card',
  templateUrl: './analytical-card.component.html',
  styleUrls: ['./analytical-card.component.scss']
})
export class AnalyticalCardComponent implements OnInit, OnChanges {
  @Input() title: string
  @Input() dataSettings: DataSettings | null = null
  @Input() chartSettings: ChartSettings
  @Input() chartOptions: ChartOptions

  private businessService = new ChartBusinessService(this.dsCoreService)
  private echartsEngine = new SmartEChartEngine()
  readonly options$ = this.echartsEngine.selectChartOptions().pipe(map(({ options }) => options)) as any

  public readonly error$ = new BehaviorSubject<string>(null)
  constructor(private dsCoreService: MetadDSCoreService) {}

  ngOnInit(): void {
    this.businessService
      .onAfterServiceInit()
      .pipe(
        tap(() => {
          this.echartsEngine.entityType = this.businessService.getEntityType()
          this.businessService.refresh()
        }),
        switchMap(() => this.businessService.selectResult()),
        filter(({error}) => {
          if (error) {
            this.error$.next(error.message)
          }
          return !error
        }),
        untilDestroyed(this)
      )
      .subscribe((result) => {
        this.echartsEngine.data = result
      })
  }

  ngOnChanges({ dataSettings, chartSettings, chartOptions }: SimpleChanges) {
    if (dataSettings) {
      this.echartsEngine.chartAnnotation = dataSettings.currentValue.chartAnnotation
      this.businessService.dataSettings = dataSettings.currentValue
    }

    if (chartSettings) {
      this.echartsEngine.settings = chartSettings.currentValue
    }

    if (chartOptions) {
      this.echartsEngine.options = chartOptions.currentValue
    }
  }

  refresh() {
    this.businessService.refresh()
  }
}
