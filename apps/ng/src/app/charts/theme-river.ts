import { ChartDimensionRoleType } from '@metad/ocap-core'

export const ThemeRiverCharts = [
  {
    title: 'Theme River',
    dataSettings: {
      dataSource: 'WASM',
      entitySet: 'CountryGDP',
      chartAnnotation: {
        chartType: {
          type: 'ThemeRiver'
        },
        dimensions: [
          {
            dimension: '[Time]',
            level: '[Time].[Year]'
          },
          {
            dimension: '[Country]',
            role: ChartDimensionRoleType.Stacked
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'GDP',
            formatting: {
              shortNumber: true
            }
          }
        ]
      }
    },
    chartSettings: {
      universalTransition: true,
      locale: 'zh-Hans',
      chartTypes: [
        {
          type: 'Bar'
        }
      ]
    },
    chartOptions: {
      singleAxis: {
        axisLabel: {
          interval: 1,
          rotate: -90,
          hideOverlap: true
        },
        axisTick: {
          interval: 0
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'rgba(0,0,0,0.2)',
            width: 1,
            type: 'solid'
          }
        }
      },
      seriesStyle: {
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.8)'
          },
          blurScope: 'series',
          focus: 'self'
        },
        label: {
          position: 'insideRight'
        }
      },
      legend: {
        show: true,
        type: 'scroll'
      }
    }
  }
]
