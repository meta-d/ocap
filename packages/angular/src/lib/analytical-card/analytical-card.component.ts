import { Component, Input, OnInit } from '@angular/core'
import { DataSettings } from '@metad/ocap-core'
import { SmartEChartEngine } from '@metad/ocap-echarts'

@Component({
  selector: 'metad-analytical-card',
  templateUrl: './analytical-card.component.html',
  styleUrls: ['./analytical-card.component.scss']
})
export class AnalyticalCardComponent implements OnInit {
  @Input() dataSettings: DataSettings | null = null

  echartsEngine = new SmartEChartEngine()
  readonly options$ = this.echartsEngine.selectChartOptions() as any

  constructor() {}

  ngOnInit(): void {
    this.echartsEngine.chartAnnotation = {
      chartType: {
        type: 'Bar'
      },
      dimensions: [
        {
          dimension: 'product'
        },
        {
          dimension: 'productCategory'
        }
      ],
      measures: [
        {
          dimension: 'Measures',
          measure: 'sales'
        }
      ]
    }

    this.echartsEngine.data = {
      results: [
        {
          product: 'A',
          sales: 100
        },
        {
          product: 'B',
          sales: 200
        },
        {
          product: 'C',
          sales: 150
        }
      ]
    }
  }
}
