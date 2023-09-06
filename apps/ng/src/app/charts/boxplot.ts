import {
  ChartAnnotation,
  ChartDataZoomType,
  ChartDimensionRoleType,
  ChartOptions,
  OrderDirection
} from '@metad/ocap-core'

export const BoxplotCharts = [
  {
    title: 'Boxplot:',
    dataSettings: {
      dataSource: 'TopSubscribed',
      entitySet: 'TopSubscribed',
      chartAnnotation: {
        chartType: {
          type: 'Boxplot'
        },
        dimensions: [
          {
            dimension: '[ChannelCategory]',
            order: OrderDirection.ASC,
            chartOptions: {
              dataZoom: {
                type: 'inside&slider'
              },
              axis: {
                interval: 0,
                axisLabel: {
                  rotate: 45
                }
              }
            }
          },
          {
            dimension: '[Channel]',
            role: ChartDimensionRoleType.Stacked
          },
          {
            dimension: '[Started]',
            role: ChartDimensionRoleType.Trellis,
            members: [
              {
                value: '[2006]'
              },
              {
                value: '[2007]'
              },
              {
                value: '[2008]'
              },
              {
                value: '[2009]'
              }
            ]
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Subscribers',
            order: OrderDirection.DESC,
            formatting: {
              shortNumber: true
            },
            palette: {
              name: 'Inferno',
              reverse: true
            },
            chartOptions: {
              axis: {
                name: 'Sales($)'
              },
              seriesStyle: {
                emphasis: {
                  focus: 'series'
                }
              },
              visualMap: {},
              dataZoom: {
                type: 'slider'
              }
            } as any
          }
        ]
      } as ChartAnnotation
    },
    chartSettings: {},
    chartOptions: {
      grid: {
        top: 30
      },
      dataZoom: {
        type: ChartDataZoomType.inside
      },
      seriesStyle: {
        selectedMode: 'single'
      },
      tooltip: {
        // trigger: 'axis',
        // axisPointer: {
        //   type: 'cross',
        //   animation: true,
        //   label: {
        //     backgroundColor: '#505765'
        //   }
        // }
      },
      visualMaps: [
        // {
        //   show: true,
        //   type: 'continuous',
        //   min: 5000,
        //   max: 10000,
        //   orient: 'horizontal',
        //   left: 'center',
        //   text: ['High Score', 'Low Score'],
        //   inRange: {
        //     color: ['#FFCE34', '#FD665F', 'black']
        //   },
        //   outOfRange: {
        //     color: ['black']
        //   }
        // }
      ]
    } as ChartOptions
  }
]
