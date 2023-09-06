import { formatNumber } from '@angular/common'
import {
  ChartAnnotation,
  ChartDataZoomType,
  ChartDimensionRoleType,
  ChartMeasureRoleType,
  ChartOptions,
  ChartOrient,
  OrderDirection,
  ReferenceLineAggregation,
  ReferenceLineType,
  ReferenceLineValueType
} from '@metad/ocap-core'

export const WaterfallCharts = [
  {
    title: 'Waterfall: Sales',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Waterfall',
          variant: 'accumulate',
        },
        dimensions: [
          {
            dimension: '[Time]',
            level: '[Time].[Month]',
            chartOptions: {
              dataZoom: {
                type: ChartDataZoomType.inside_slider
              }
            }
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Sales',
            referenceLines: [
              {
                label: '最大值',
                type: ReferenceLineType.markPoint,
                aggregation: ReferenceLineAggregation.max,
                valueType: ReferenceLineValueType.dynamic
              },
              {
                label: '最小值',
                type: ReferenceLineType.markPoint,
                aggregation: ReferenceLineAggregation.min,
                valueType: ReferenceLineValueType.dynamic
              },
              {
                label: '阈值',
                type: ReferenceLineType.markLine,
                valueType: ReferenceLineValueType.fixed,
                value: 100000
              }
            ],
            palette: {
              name: 'PuOr'
            },
            chartOptions: {
              axis: {
                name: 'Sales($)'
              },
              seriesStyle: {
                accumulate: true,
                markArea: {
                  itemStyle: {
                    color: 'lightgrey',
                    opacity: .5,
                    borderColor: 'black',
                    borderWidth: 2
                  },
                  data: [
                    [
                      {
                        yAxis: 50000
                      },
                      {
                        yAxis: 100000
                      }
                    ]
                  ]
                }
              }
            } as any
          },
        ]
      } as ChartAnnotation
    },
    chartSettings: {},
    chartOptions: {
      animationDuration: 1000,
      grid: {
        top: 30
      },
      seriesStyle: {
        selectedMode: 'single',
        // label: {
        //   show: true,
        //   position: 'top',
        //   formatter: (params) => {
        //     return formatNumber(params.data['Sales'] / params.data[totalMeasureName('Sales') ] * 100, 'en', '0.1-1') + '%'
        //   }
        // },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          animation: true,
          label: {
            backgroundColor: '#505765'
          }
        }
      }
    } as ChartOptions
  },
  {
    title: 'Waterfall: Sales',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Waterfall'
        },
        dimensions: [
          {
            dimension: '[Time]',
            level: '[Time].[Month]',
            chartOptions: {
              dataZoom: {
                type: ChartDataZoomType.inside_slider
              }
            }
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Sales',
            referenceLines: [
              {
                label: '最大值',
                type: ReferenceLineType.markPoint,
                aggregation: ReferenceLineAggregation.max,
                valueType: ReferenceLineValueType.dynamic
              },
              {
                label: '最小值',
                type: ReferenceLineType.markPoint,
                aggregation: ReferenceLineAggregation.min,
                valueType: ReferenceLineValueType.dynamic
              },
              {
                label: '阈值',
                type: ReferenceLineType.markLine,
                valueType: ReferenceLineValueType.fixed,
                value: 100000
              }
            ],
            palette: {
              name: 'PuOr'
            },
            chartOptions: {
              axis: {
                name: 'Sales($)'
              },
              seriesStyle: {
                markArea: {
                  itemStyle: {
                    color: 'lightgrey',
                    opacity: .5,
                    borderColor: 'black',
                    borderWidth: 2
                  },
                  data: [
                    [
                      {
                        yAxis: 50000
                      },
                      {
                        yAxis: 100000
                      }
                    ]
                  ]
                }
              }
            } as any
          },
        ]
      } as ChartAnnotation
    },
    chartSettings: {},
    chartOptions: {
      animationDuration: 1000,
      grid: {
        top: 30
      },
      legend: {
        show: true,
      },
      seriesStyle: {
        selectedMode: 'single',
        // label: {
        //   show: true,
        //   position: 'top',
        //   formatter: (params) => {
        //     return formatNumber(params.data['Sales'] / params.data[totalMeasureName('Sales') ] * 100, 'en', '0.1-1') + '%'
        //   }
        // },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          animation: true,
          label: {
            backgroundColor: '#505765'
          }
        }
      }
    } as ChartOptions
  },

  {
    title: 'Waterfall horizontal sales',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Waterfall',
          orient: ChartOrient.horizontal
        },
        dimensions: [
          {
            dimension: '[Time]',
            level: '[Time].[Month]',
            chartOptions: {
              dataZoom: {
                type: ChartDataZoomType.inside_slider
              }
            }
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Sales',
            referenceLines: [
              {
                label: '最大值',
                type: ReferenceLineType.markPoint,
                aggregation: ReferenceLineAggregation.max,
                valueType: ReferenceLineValueType.dynamic
              },
              {
                label: '最小值',
                type: ReferenceLineType.markPoint,
                aggregation: ReferenceLineAggregation.min,
                valueType: ReferenceLineValueType.dynamic
              },
              {
                label: '阈值',
                type: ReferenceLineType.markLine,
                valueType: ReferenceLineValueType.fixed,
                value: 100000
              }
            ],
            palette: {
              name: 'PuOr'
            },
            chartOptions: {
              axis: {
                name: 'Sales($)'
              },
              dataZoom: {
                type: ChartDataZoomType.inside_slider
              },
              seriesStyle: {
                markArea: {
                  itemStyle: {
                    color: 'lightgrey',
                    opacity: .5,
                    borderColor: 'black',
                    borderWidth: 2
                  },
                  data: [
                    [
                      {
                        yAxis: 50000
                      },
                      {
                        yAxis: 100000
                      }
                    ]
                  ]
                }
              }
            } as any
          },
        ]
      } as ChartAnnotation
    },
    chartSettings: {},
    chartOptions: {
      animationDuration: 1000,
      grid: {
        top: 30
      },
      seriesStyle: {
        selectedMode: 'single',
        // label: {
        //   show: true,
        //   position: 'top',
        //   formatter: (params) => {
        //     return formatNumber(params.data['Sales'] / params.data[totalMeasureName('Sales') ] * 100, 'en', '0.1-1') + '%'
        //   }
        // },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          animation: true,
          label: {
            backgroundColor: '#505765'
          }
        }
      }
    } as ChartOptions
  },

  {
    title: 'Waterfall: Sales',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Waterfall',
          variant: 'polar',
          orient: ChartOrient.vertical
        },
        dimensions: [
          {
            dimension: '[Time]',
            level: '[Time].[Month]',
            chartOptions: {
              dataZoom: {
                type: ChartDataZoomType.inside_slider
              }
            }
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Sales',
            referenceLines: [
              {
                label: '最大值',
                type: ReferenceLineType.markPoint,
                aggregation: ReferenceLineAggregation.max,
                valueType: ReferenceLineValueType.dynamic
              },
              {
                label: '最小值',
                type: ReferenceLineType.markPoint,
                aggregation: ReferenceLineAggregation.min,
                valueType: ReferenceLineValueType.dynamic
              },
              {
                label: '阈值',
                type: ReferenceLineType.markLine,
                valueType: ReferenceLineValueType.fixed,
                value: 100000
              }
            ],
            palette: {
              name: 'PuOr'
            },
            chartOptions: {
              axis: {
                name: 'Sales($)'
              },
              seriesStyle: {
                label: {
                  show: false
                }
              }
            } as any
          },
        ]
      } as ChartAnnotation
    },
    chartSettings: {},
    chartOptions: {
      animationDuration: 1000,
      grid: {
        top: 30
      },
      seriesStyle: {
        selectedMode: 'single',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          animation: true,
          label: {
            backgroundColor: '#505765'
          }
        }
      }
    } as ChartOptions
  },

]
