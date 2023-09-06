import { ChartAnnotation, ChartOptions, cloneDeep } from '@metad/ocap-core'

const SankeyChart = {
  title: 'Sankey',
  dataSettings: {
    dataSource: 'FOODMART',
    entitySet: 'Sales',
    chartAnnotation: {
      chartType: {
        type: 'Sankey'
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
      levels: [
        {
          depth: 1,
          lineStyle: {
            color: 'source',
            curveness: 0.5
          },
          itemStyle: {
            color: '#1f77b4',
            borderColor: '#1f77b4'
          }
        }
      ]
    },
    tooltip: {},
    legend: {}
  } as ChartOptions
}

export const SankeyCharts = [
  SankeyChart,
  {
    title: 'Sankey',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Sankey'
        },
        dimensions: [
          {
            dimension: '[Time]',
            level: '[Time].[Year]'
          },
          {
            dimension: '[Store]',
            level: '[Store].[Country]'
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
        name: 'Store Sales',
        levels: [
          {
            depth: 0,
            itemStyle: {
              borderWidth: 0,
              gapWidth: 5
            }
          },
          {
            depth: 1,
            itemStyle: {
              gapWidth: 1
            }
          },
          {
            depth: 2,
            colorSaturation: [0.35, 0.5],
            itemStyle: {
              gapWidth: 1,
              borderColorSaturation: 0.6
            }
          }
        ]
      },
      tooltip: {},
      legend: {}
    } as ChartOptions
  }
]

const SankeyWithMeasures = cloneDeep(SankeyChart)
SankeyWithMeasures.dataSettings.chartAnnotation.measures.push({
  dimension: 'Measures',
  measure: 'Profit',
})
SankeyCharts.push(SankeyWithMeasures)
