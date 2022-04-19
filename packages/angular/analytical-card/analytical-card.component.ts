import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { OcapDSCoreService } from '@metad/ocap-angular/core'
import { ChartBusinessService, DataSettings } from '@metad/ocap-core'
import { SmartEChartEngine } from '@metad/ocap-echarts'
import { UntilDestroy } from '@ngneat/until-destroy'
import { map } from 'rxjs/operators'

@UntilDestroy()
@Component({
  selector: 'metad-analytical-card',
  templateUrl: './analytical-card.component.html',
  styleUrls: ['./analytical-card.component.scss']
})
export class AnalyticalCardComponent implements OnInit, OnChanges {
  @Input() title: string
  @Input() dataSettings: DataSettings | null = null

  private businessService = new ChartBusinessService(this.dsCoreService)
  private echartsEngine = new SmartEChartEngine()
  readonly options$ = this.echartsEngine.selectChartOptions().pipe(map(({ options }) => options)) as any

  constructor(private dsCoreService: OcapDSCoreService) {
    //
  }

  ngOnInit(): void {
    this.businessService.selectResult().subscribe((result) => {
      this.echartsEngine.data = result
    })
  }

  ngOnChanges({ dataSettings }: SimpleChanges) {
    if (dataSettings) {
      this.echartsEngine.chartAnnotation = dataSettings.currentValue.chartAnnotation
      this.businessService.dataSettings = dataSettings.currentValue
      this.businessService.refresh()
    }
  }
}
