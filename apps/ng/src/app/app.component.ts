import { Component } from '@angular/core'
import { SmartFilterOptions } from '@metad/ocap-angular/controls'
import { DisplayDensity, NgmDSCoreService, NgmSmartFilterBarService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { AgentType, FilterSelectionType } from '@metad/ocap-core'
import { ANALYTICAL_CARDS, DUCKDB_WASM_MODEL } from '@metad/ocap-duckdb'

@Component({
  selector: 'metad-ocap-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [NgmSmartFilterBarService]
})
export class AppComponent {
  dataSettings = {
    dataSource: 'Sales',
    entitySet: 'SalesOrder'
  }
  smartFilterOptions: SmartFilterOptions = {
    dimension: {
      dimension: 'OrderId'
    },
    appearance: 'outline',
    displayDensity: DisplayDensity.compact
  }
  productFilterOptions: SmartFilterOptions = {
    dimension: {
      dimension: 'product'
    },
    appearance: 'outline',
    displayDensity: DisplayDensity.compact,
    selectionType: FilterSelectionType.Multiple,
    maxTagCount: 2,
    autoActiveFirst: true
  }
  productDimension = {
    dimension: 'product'
  }
  departmentDimension = {
    dimension: 'Department',
    displayHierarchy: true
  }
  slicer = { members: [{ value: 301860 }] }
  product = null
  department = null
  cards: any = [
    // {
    //   title: 'Movies (WASM JSON)',
    //   dataSettings: {
    //     dataSource: 'NG_WASM_MODEL',
    //     entitySet: 'Movies',
    //     chartAnnotation: {
    //       chartType: {
    //         type: 'Bar',
    //       },
    //       dimensions: [
    //         {
    //           dimension: 'Creative Type'
    //         }
    //       ],
    //       measures: [
    //         {
    //           dimension: 'Measures',
    //           measure: 'IMDB Votes',
    //           formatting: {
    //             shortNumber: true
    //           }
    //         }
    //       ]
    //     },
    //   },
    //   chartSettings: {
    //     universalTransition: true
    //   },
    //   chartOptions: {
    //     dataZoom: {
    //       type: ChartDataZoomType.INSIDE
    //     },
    //     seriesStyle: {
    //       selectedMode: 'single',
    //       itemStyle: {
    //       }
    //     }
    //   } as ChartOptions
    // },
    // // CARTESIAN_CARDS[CARTESIAN_CARDS.length - 2],
    // ...ANALYTICAL_CARDS
    ANALYTICAL_CARDS[0]
  ]
  constructor(
    private smartFilterBar: NgmSmartFilterBarService,
    wasmAgent: WasmAgentService,
    dsCoreService: NgmDSCoreService
  ) {
    setTimeout(() => {
      wasmAgent.registerModel({
        name: 'NG_WASM_MODEL',
        type: 'SQL',
        agentType: AgentType.Wasm,
        catalog: 'jm',
        tables: [
          {
            name: 'Movies',
            sourceUrl: window.location.origin + '/assets/data/movies.json',
            // sourceUrl: 'https://raw.githubusercontent.com/duckdb/duckdb-wasm/master/data/vega/movies.json',
            type: 'json'
          }
        ]
      })

      dsCoreService.registerModel({
        name: 'NG_WASM_MODEL',
        type: 'SQL',
        agentType: AgentType.Wasm,
        catalog: 'jm',
        settings: {
          ignoreUnknownProperty: true
        }
        // dialect: 'duckdb',
      })
    })

    wasmAgent.registerModel(DUCKDB_WASM_MODEL)
  }

  onSlicerChange(slicer) {
    this.smartFilterBar.put(slicer)
    this.smartFilterBar.go()
  }
}
