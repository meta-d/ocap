import {
  ChartAnnotation,
  ChartDimensionRoleType,
  ChartMeasureRoleType,
  ChartOptions,
} from '@metad/ocap-core'

export const ScatterCharts = [
  {
    title: 'Scatter: Store yearly sales and cost',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Scatter'
        },
        dimensions: [
          {
            dimension: '[Store]',
            level: '[Store].[State]'
          },
          {
            dimension: '[Time]',
            level: '[Time].[Year]',
            role: ChartDimensionRoleType.Group
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Sales',
            formatting: {
              digitsInfo: '0.1-1'
            },
            chartOptions: {
              axis: {
                name: '销售额'
              }
            }
          },
          {
            dimension: 'Measures',
            measure: 'Cost',
            chartOptions: {
              axis: {
                name: '计算成本'
              }
            }
          },
          {
            dimension: 'Measures',
            measure: 'Profit',
            role: ChartMeasureRoleType.Size,
            chartOptions: {
              visualMap: {
                show: true,
                right: '0',
                bottom: 0,
                calculable: true,
              }
            }
          },
          {
            dimension: 'Measures',
            measure: 'Profit',
            role: ChartMeasureRoleType.Lightness,
            palette: {
              name: 'PuOr'
            },
            chartOptions: {
              visualMap: {
                show: true,
                right: '0',
                top: 0,
                calculable: true,
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
        selectedMode: 'single'
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
      legend: {

      }
    } as ChartOptions
  },

  {
    title: 'Scatter: Polar',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Scatter',
          variant: 'polar'
        },
        dimensions: [
          {
            dimension: '[Store]',
            level: '[Store].[State]'
          },
          {
            dimension: '[Time]',
            level: '[Time].[Year]',
            role: ChartDimensionRoleType.Group
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Sales',
            formatting: {
              digitsInfo: '0.1-1'
            },
            chartOptions: {
              axis: {
                name: '销售额'
              }
            }
          },
          {
            dimension: 'Measures',
            measure: 'Cost',
            chartOptions: {
              axis: {
                name: '计算成本'
              }
            }
          },
          {
            dimension: 'Measures',
            measure: 'Profit',
            role: ChartMeasureRoleType.Size,
            chartOptions: {
              visualMap: {
                show: true,
                right: '0',
                bottom: 0,
                calculable: true,
              }
            }
          },
          {
            dimension: 'Measures',
            measure: 'Profit',
            role: ChartMeasureRoleType.Lightness,
            palette: {
              name: 'PuOr'
            },
            chartOptions: {
              visualMap: {
                show: true,
                right: '0',
                top: 0,
                calculable: true,
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
        selectedMode: 'single'
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
      legend: {

      }
    } as ChartOptions
  },
]
