import { Component } from '@angular/core'
import { NgmDSCoreService, NgmSmartFilterBarService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { AgentType, ChartDataZoomType, ChartOptions, OrderDirection } from '@metad/ocap-core'
import { ANALYTICAL_CARDS, CARTESIAN_CARDS, DUCKDB_WASM_MODEL } from '@metad/ocap-duckdb'


@Component({
  selector: 'metad-ocap-public',
  templateUrl: 'public.component.html',
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
      }
      ngm-analytical-card {
        height: 350px;
        border-radius: 6px;
        box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
      }
    `
  ],
})
export class PublicComponent {
  cards: any = [
    // {
    //   title: 'TripPin OData',
    //   dataSettings: {
    //     dataSource: 'TripPin',
    //     entitySet: 'Trip',
    //     chartAnnotation: {
    //       chartType: {
    //         type: 'Bar',
    //       },
    //       dimensions: [
    //         {
    //           dimension: 'ShareId'
    //         }
    //       ],
    //       measures: [
    //         {
    //           dimension: 'Measures',
    //           measure: 'Budget',
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
    {
      title: 'Movies (WASM JSON)',
      dataSettings: {
        dataSource: 'NG_WASM_MODEL',
        entitySet: 'Movies',
        chartAnnotation: {
          chartType: {
            type: 'Bar',
          },
          dimensions: [
            {
              dimension: 'Creative Type'
            }
          ],
          measures: [
            {
              dimension: 'Measures',
              measure: 'IMDB Votes',
              formatting: {
                shortNumber: true
              }
            }
          ]
        },
      },
      chartSettings: {
        universalTransition: true
      },
      chartOptions: {
        dataZoom: {
          type: ChartDataZoomType.inside
        },
        seriesStyle: {
          selectedMode: 'single',
          itemStyle: {
          }
        }
      } as ChartOptions
    },
    // // CARTESIAN_CARDS[CARTESIAN_CARDS.length - 2],
    ...ANALYTICAL_CARDS
  ]

  constructor(
    private wasmAgent: WasmAgentService,
    private dsCoreService: NgmDSCoreService) {

    
    // this.smartFilterBar.change([
    //   {
    //     dimension: {
    //       dimension: 'Creative Type'
    //     },
    //     members: [
    //       {value: 'Contemporary Fiction'}
    //     ]
    //   }
    // ])

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

      wasmAgent.registerModel(DUCKDB_WASM_MODEL)

      // // OData DataSource
      // dsCoreService.registerModel({
      //   name: 'TripPin',
      //   type: 'OData',
      //   agentType: AgentType.Browser
      // })
    })
  }
}
