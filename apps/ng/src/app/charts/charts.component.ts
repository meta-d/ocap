import { Component } from '@angular/core'
import { DisplayDensity } from '@metad/ocap-angular/core'
import { ChartAnnotation, ChartDimensionRoleType, ChartOptions, C_MEASURES, DataSettings, OrderDirection, QueryReturn } from '@metad/ocap-core'
import {
  ANALYTICAL_CARDS,
  CARTESIAN_CARDS,
  COVID19_DAILY_CHARTS,
  DUCKDB_UNEMPLOYMENT_CARDS,
  FOODMART_CHARTS,
  SALES_CHARTS
} from '@metad/ocap-duckdb'
import { D3Charts } from './3d'
import { BarCharts } from './bar'
import { BoxplotCharts } from './boxplot'
import { CustomCharts } from './custom'
import { DrillDimensions } from './drill'
import { FunnelCharts } from './funnel'
import { GeomapCharts } from './geomap'
import { HeatmapCharts } from './heatmap'
import { LineCharts } from './line'
import { PieCharts } from './pie'
import { SankeyCharts } from './sankey'
import { ScatterCharts } from './scatter'
import { SunburstCharts } from './sunburst'
import { ThemeRiverCharts } from './theme-river'
import { TopSubscribedCards } from './topSubscribed'
import { TreeCharts } from './tree'
import { TreemapCharts } from './treemap'
import { TrellisCharts } from './trellis'
import { WaterfallCharts } from './waterfall'


@Component({
  selector: 'metad-ocap-charts',
  templateUrl: 'charts.component.html',
  styles: [
    `
      .ngm-analytical-card, .ngm-analytical-grid {
        height: 400px;
      }
    `
  ]
})
export class ChartsComponent {
  DisplayDensity = DisplayDensity

  dataSettings: DataSettings = {
    dataSource: 'Sales',
    entitySet: 'SalesOrder',
    analytics: {
      rows: [
        {
          dimension: '[product]'
        }
      ],
      columns: [
        {
          dimension: 'sales'
        }
      ]
    }
  }

  cards: any = [
    ...WaterfallCharts,
    ...BoxplotCharts,
    ...TopSubscribedCards,
    ...DrillDimensions,
    ...CustomCharts,
    ...D3Charts,
    ...BarCharts,
    ...LineCharts,
    ...TrellisCharts,
    ...PieCharts,
    ...ThemeRiverCharts,
    ...ScatterCharts,
    ...HeatmapCharts,
    ...SunburstCharts,
    ...TreeCharts,
    ...TreemapCharts,
    ...SankeyCharts,
    ...FunnelCharts,
    ...GeomapCharts,
    ...SALES_CHARTS,
    ...ANALYTICAL_CARDS,
    ...COVID19_DAILY_CHARTS,
    ...DUCKDB_UNEMPLOYMENT_CARDS,
  ]

  onUnemploymentCalendar(model) {
    const selectOptions = []
    // if (this.unemploymentCalendar.members?.length) {
    //   selectOptions.push(this.unemploymentCalendar)
    // }
    // if (this.unemploymentRegion.members?.length) {
    //   selectOptions.push(this.unemploymentRegion)
    // }
    // this.unemploymentCards.forEach((item) => {
    //   item.dataSettings = {
    //     ...item.dataSettings,
    //     selectionVariant: {
    //       ...(item.dataSettings.selectionVariant ?? {}),
    //       selectOptions
    //     }
    //   }
    // })
  }

  onLinkAnalysis(event) {
    console.log(event)
  }

  onExplain(event: any[]) {
    // console.log(event)
  }
}
