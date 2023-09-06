import { ChartAnnotation, ChartOptions } from '@metad/ocap-core'

const TreeChart = {
  title: 'Tree',
  dataSettings: {
    dataSource: 'FOODMART',
    entitySet: 'Sales',
    chartAnnotation: {
      chartType: {
        type: 'Tree'
      },
      dimensions: [
        {
          dimension: '[Store]',
          level: '[Store].[City]',
          displayHierarchy: true
        }
      ],
      measures: [
        {
          dimension: 'Measures',
          measure: 'Sales',
          chartOptions: {
            visualMap: {
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
    legend: {}
  } as ChartOptions
}

export const TreeCharts = [
  TreeChart,

  {
    ...TreeChart,
    dataSettings: {
      ...TreeChart.dataSettings,
      chartAnnotation: {
        ...TreeChart.dataSettings.chartAnnotation,
        chartType: {
          ...TreeChart.dataSettings.chartAnnotation.chartType,
          variant: 'reverse'
        }
      }
    }
  },

  {
    title: 'Radial Tree',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Tree',
          variant: 'radial'
        },
        dimensions: [
          {
            dimension: '[Store]',
            level: '[Store].[City]',
            displayHierarchy: true
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Sales',
            chartOptions: {
              visualMap: {
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
      legend: {}
    } as ChartOptions
  }
]
