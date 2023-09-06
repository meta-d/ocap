import { AnalyticsAnnotation, ChartAnnotation, ChartDataZoomType, ChartDimensionRoleType, ChartMeasureRoleType, ChartOptions, C_MEASURES, OrderDirection } from '@metad/ocap-core'

export const TopSubscribedCards = [
  {
    title: 'Scatter: ',
    dataSettings: {
      dataSource: 'TopSubscribed',
      entitySet: 'TopSubscribed',
      chartAnnotation: {
        chartType: {
          type: 'Scatter'
        },
        dimensions: [
          {
            dimension: '[ChannelCategory]',
          },
        ],
        measures: [
          {
            dimension: C_MEASURES,
            measure: 'Channel Count',
            formatting: {
              digitsInfo: '0.1-1'
            },
            chartOptions: {
              axis: {
              },
              dataZoom: {
                type: ChartDataZoomType.inside_slider
              }
            }
          },
          {
            dimension: C_MEASURES,
            measure: 'Subscribers',
            chartOptions: {
              axis: {
                name: ''
              },
              dataZoom: {
                type: ChartDataZoomType.inside_slider
              }
            }
          },
          {
            dimension: C_MEASURES,
            measure: 'Video Count',
            role: ChartMeasureRoleType.Lightness,
            chartOptions: {
              visualMap: {
                show: true,
                right: '0',
                bottom: 0,
                calculable: true,
              }
            }
          },
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
    title: 'Grid: ',
    dataSettings: {
      dataSource: 'TopSubscribed',
      entitySet: 'TopSubscribed',
      analytics: {
        rows: [
          {
            dimension: '[Channel]',
            hierarchy: '[Channel.Category]'
          }
        ],
        columns: [
          {
            dimension: C_MEASURES,
            members: ['Channel Count', 'Video Count']
          }
        ]
      } as AnalyticsAnnotation
    }
  },
  {
    title: 'Pie: ',
    dataSettings: {
      dataSource: 'TopSubscribed',
      entitySet: 'TopSubscribed',
      chartAnnotation: {
        chartType: {
          type: 'Pie'
        },
        dimensions: [
          {
            dimension: '[Channel]',
            hierarchy: '[Channel.Category]'
          }
        ],
        measures: [
          {
            dimension: C_MEASURES,
            measure: 'Channel Count',
            order: OrderDirection.DESC
          }
        ]
      }
    },
    chartOptions: {
      seriesStyle: {
        label: {
          position: 'inside',
          rotate: true
        }
      },
      legend: {
        show: true
      }
    }
  },
  {
    title: 'Bar: Stacked',
    dataSettings: {
      dataSource: 'TopSubscribed',
      entitySet: 'TopSubscribed',
      chartAnnotation: {
        chartType: {
          type: 'Bar'
        },
        dimensions: [
          {
            dimension: '[ChannelCategory]'
          },
          {
            dimension: '[Channel]',
            role: ChartDimensionRoleType.Stacked
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Subscribers',
            order: OrderDirection.DESC,
            palette: {
              name: 'Inferno',
              reverse: true
            },
            formatting: {
              shortNumber: true
            }
          }
        ]
      } as ChartAnnotation
    },
    chartSettings: {},
    chartOptions: {
      grid: {
        top: 30
      },
      dataZoom: {},
      seriesStyle: {
        selectedMode: 'single'
      },
      tooltip: {},
      visualMaps: []
    } as ChartOptions
  },
  {
    title: 'Pie: ',
    dataSettings: {
      dataSource: 'TopSubscribed',
      entitySet: 'TopSubscribed',
      chartAnnotation: {
        chartType: {
          type: 'Bar'
        },
        dimensions: [
          {
            dimension: '[Started]',
            order: OrderDirection.ASC
          },
          {
            dimension: '[ChannelCategory]',
            role: ChartDimensionRoleType.Stacked,
            order: OrderDirection.ASC
          }
        ],
        measures: [
          {
            dimension: C_MEASURES,
            measure: 'Channel Count',
          }
        ]
      }
    },
    chartOptions: {
      seriesStyle: {
        label: {
          position: 'inside',
          rotate: true
        }
      },
      legend: {
        show: true
      }
    }
  }
]
