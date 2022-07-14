import { Component, OnInit } from '@angular/core'
import { DataSettings } from '@metad/ocap-core'
import { ANALYTICAL_CARDS } from '@metad/ocap-duckdb'

@Component({
  selector: 'metad-ocap-charts',
  templateUrl: 'charts.component.html'
})
export class ChartsComponent {
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
    // ...ANALYTICAL_CARDS
    ANALYTICAL_CARDS[ANALYTICAL_CARDS.length - 1]
  ]

}
