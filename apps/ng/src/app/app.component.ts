import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { SmartFilterOptions } from '@metad/ocap-angular/controls'
import { DisplayDensity, NgmAppearance, NgmDSCoreService, NgmSmartFilterBarService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { AgentStatus, AgentType, DataSettings, DisplayBehaviour, FilterSelectionType, MemberSource } from '@metad/ocap-core'
import { ANALYTICAL_CARDS, CARTESIAN_CARDS, DUCKDB_COVID19_DAILY_MODEL, DUCKDB_FOODMART_MODEL, DUCKDB_TOP_SUBSCRIBED_MODEL, DUCKDB_UNEMPLOYMENT_MODEL, DUCKDB_WASM_MODEL } from '@metad/ocap-duckdb'
import { cloneDeep } from 'lodash-es'
import { Observable } from 'rxjs'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'metad-ocap-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [NgmSmartFilterBarService]
})
export class AppComponent implements OnInit {
  MemberSource = MemberSource
  DisplayBehaviour = DisplayBehaviour
  dark: string
  appearance: NgmAppearance = {
    appearance: 'outline',
    displayDensity: DisplayDensity.compact
  }
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
  smartFilterOptions: SmartFilterOptions = {
    dimension: {
      dimension: '[product]'
    },
  }
  productFilterOptions: SmartFilterOptions = {
    dimension: {
      dimension: 'product'
    },
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
    // CARTESIAN_CARDS[0],
    // ...ANALYTICAL_CARDS,
    ANALYTICAL_CARDS[0]
  ]

  error: string
  
  public readonly status$ = this.wasmAgent.selectStatus() as Observable<AgentStatus>

  store
  store1
  formula = `[Measures].[Sales] - [Measures].[Cost]`
  constructor(
    private smartFilterBar: NgmSmartFilterBarService,
    private wasmAgent: WasmAgentService,
    private dsCoreService: NgmDSCoreService
  ) {
    this.wasmAgent.selectError().subscribe((error) => {
      console.error(error)
      this.error += error + '\n'
    })
  }

  async ngOnInit() {
    setTimeout(async () => {
      // this.wasmAgent.registerModel({
      //   name: 'NG_WASM_MODEL',
      //   type: 'SQL',
      //   agentType: AgentType.Wasm,
      //   dialect: 'duckdb',
      //   catalog: 'jm',
      //   tables: [
      //     {
      //       name: 'Movies',
      //       sourceUrl: window.location.origin + '/assets/data/movies.json',
      //       type: 'json'
      //     }
      //   ]
      // })

      // this.dsCoreService.registerModel({
      //   name: 'NG_WASM_MODEL',
      //   type: 'SQL',
      //   agentType: AgentType.Wasm,
      //   dialect: 'duckdb',
      //   catalog: 'jm',
      //   settings: {
      //     ignoreUnknownProperty: true
      //   },
      // })
      
      await this.wasmAgent.registerModel(DUCKDB_WASM_MODEL)
      await this.wasmAgent.registerModel(DUCKDB_COVID19_DAILY_MODEL)
      await this.wasmAgent.registerModel(DUCKDB_FOODMART_MODEL)
      await this.wasmAgent.registerModel(DUCKDB_UNEMPLOYMENT_MODEL)
      await this.wasmAgent.registerModel(DUCKDB_TOP_SUBSCRIBED_MODEL)


      // await this.wasmAgent.registerModel({
      //   ...DUCKDB_FOODMART_MODEL,
      //   name: 'ERROR',
      //   tables: [
      //     {
      //       name: 'sales_fact',
      //       type: 'csv',
      //       sourceUrl: '/assets/data/foodmart/sales_fact.csv',
      //       delimiter: ','
      //     },
      //   ]
      // })
    }, 500)
  }

  onSlicerChange(slicer) {
    this.smartFilterBar.put(slicer)
    this.smartFilterBar.go()
  }

  refresh() {
    this.smartFilterOptions = cloneDeep(this.smartFilterOptions)
  }

  onFormulaChange(event: string) {
    console.log(event)
  }
}
