import { Component } from '@angular/core'
import { DisplayDensity, NgmSmartFilterBarService } from '@metad/ocap-angular/core'
import { ISlicer } from '@metad/ocap-core'
import { FOODMART_CHARTS } from '@metad/ocap-duckdb'
import { MeasureRowGrid } from './grid'
import { IndicatorCharts } from './indicators'
import { MemberLists } from './member-list'
import { MemberTrees } from './member-tree'
import { MemberTables } from './member-table'
import { SmartFilters } from './smart-filter'

@Component({
  selector: 'metad-ocap-foodmart',
  templateUrl: 'foodmart.component.html',
  styles: [],
  providers: [NgmSmartFilterBarService]
})
export class FoodMartComponent {
  DisplayDensity = DisplayDensity
  slicer: ISlicer = null
  store: ISlicer = null

  cards: any = [
    ...MemberTrees,
    ...MemberLists,
    ...MemberTables,
    ...SmartFilters,
    {
      type: 'SmartSelect',
      dataSettings: {
        dataSource: 'FOODMART',
        entitySet: 'Sales'
      },
      dimension: {
        dimension: '[Store]'
      },
      options: {
        multiple: true,
      }
    },
    MeasureRowGrid,
    ...FOODMART_CHARTS,
    ...IndicatorCharts
  ]

  constructor(private smartFilter: NgmSmartFilterBarService) {}

  trackByIndex(index: number, item: any) {
    return index
  }

  onColumnSelectionChanging(event) {
    console.log(event)
  }

  onSlicerChange(event, card?) {
    console.log(`${card?.title} slicers changed:`, event)
    this.cards.filter((item) => item !== card).forEach((card) => card.slicers = Array.isArray(event) ? event : event ? [event] : [])
  }

  onChartClick(event) {
    console.log(`chart click:`, event)
  }

  onChartHighlight(event) {
    console.log(`chart highlight`, event)
  }

  onChartContextMenu(event) {
    console.log(`chart context menu:`, event)
  }

  onExplain(event) {
    console.log(`explain:`, event)
  }
}
