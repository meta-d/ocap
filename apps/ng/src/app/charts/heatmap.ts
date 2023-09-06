import { ChartAnnotation, ChartDataZoomType, ChartDimensionRoleType, ChartOptions } from '@metad/ocap-core'

export const HeatmapCharts = [
  {
    title: 'Sales Heatmap',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Heatmap'
        },
        dimensions: [
          {
            dimension: '[Store]',
            level: '[Store].[State]',
            chartOptions: {
              axis: {
                name: '门店区域',
                nameLocation: 'center',
                nameGap: 30
              },
              dataZoom: {
                type: ChartDataZoomType.inside,
              },
            }
          },
          {
            dimension: '[Time]',
            level: '[Time].[Year]',
            chartOptions: {
              axis: {
                name: '销售时间',
                nameLocation: 'end'
              },
              dataZoom: {
                type: ChartDataZoomType.inside,
              },
            }
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Sales',
            chartOptions: {
              visualMap: {
                right: 0,
                color: ['black', 'red']
              }
            }
          }
        ]
      } as ChartAnnotation
    },
    chartSettings: {},
    chartOptions: {
      grid: {
        top: 50,
        right: 100,
        bottom: 30
      },
      dataZoom: {
        type: ChartDataZoomType.inside,
        orient: 'vertical'
      },
      tooltip: {
        axisPointer: {
          // type: 'cross',
          animation: true,
          label: {
            backgroundColor: '#505765'
          }
        }
      },
      legend: {}
    } as ChartOptions
  },
  {
    title: 'Calendar Heatmap',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Heatmap',
          variant: 'calendar'
        },
        dimensions: [
          {
            dimension: '[Time]',
            level: '[Time].[Day]',
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Sales',
            palette: {
              name: 'PuOr'
            },
            chartOptions: {
              visualMap: {
                show: true,
                right: 0
              }
            }
          }
        ]
      } as ChartAnnotation
    },
    chartSettings: {},
    chartOptions: {
      grid: {
        top: 30,
        right: 100
      },
      seriesStyle: {
        selectedMode: 'single',
        dateFormatter: 'yyyy-MM-dd'
      },
      tooltip: {
        axisPointer: {
          type: 'cross',
          animation: true,
          label: {
            backgroundColor: '#505765'
          }
        }
      },
      legend: {}
    } as ChartOptions
  },

  // {
  //   title: 'Calendar Heatmap Trellis',
  //   dataSettings: {
  //     dataSource: 'FOODMART',
  //     entitySet: 'Sales',
  //     chartAnnotation: {
  //       chartType: {
  //         type: 'Heatmap',
  //         variant: 'calendar'
  //       },
  //       dimensions: [
  //         {
  //           dimension: '[Time]',
  //           level: '[Time].[Day]',
  //         },
  //         // 未支持两个设置同一个维度的不同层级
  //         {
  //           dimension: '[Time]',
  //           level: '[Time].[Year]',
  //           role: ChartDimensionRoleType.Trellis
  //         }
  //       ],
  //       measures: [
  //         {
  //           dimension: 'Measures',
  //           measure: 'Sales',
  //           palette: {
  //             name: 'PuOr'
  //           },
  //           chartOptions: {
  //             // visualMap: {
  //             //   right: 0
  //             // }
  //           }
  //         }
  //       ]
  //     } as ChartAnnotation
  //   },
  //   chartSettings: {},
  //   chartOptions: {
  //     grid: {
  //       top: 30,
  //       right: 100
  //     },
  //     seriesStyle: {
  //       selectedMode: 'single',
  //       dateFormatter: 'yyyy-MM-dd'
  //     },
  //     tooltip: {
  //       axisPointer: {
  //         type: 'cross',
  //         animation: true,
  //         label: {
  //           backgroundColor: '#505765'
  //         }
  //       }
  //     },
  //     legend: {}
  //   } as ChartOptions
  // }
]
