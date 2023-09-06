import { ChartAnnotation, ChartMeasureRoleType, ChartOptions } from '@metad/ocap-core'

export const FunnelCharts = [
  {
    title: 'Funnel',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Funnel'
        },
        dimensions: [],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Sales',
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
                right: '0',
                bottom: 200
              }
            }
          }
        ]
      } as ChartAnnotation
    },
    chartSettings: {},
    chartOptions: {
      title: {
        text: 'Funnel Compare',
        subtext: 'Fake Data',
        left: 'left',
        top: 'bottom'
      },
      legend: {}
    } as ChartOptions
  }
]
