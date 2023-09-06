import {
  ChartAnnotation,
  ChartDataZoomType,
  ChartDimensionRoleType,
  ChartMeasureRoleType,
  ChartOptions,
  ChartOrient,
  C_MEASURES,
  OrderDirection,
  ReferenceLineAggregation,
  ReferenceLineType,
  ReferenceLineValueType
} from '@metad/ocap-core'

export const LineCharts = [
  {
    title: 'Line: UserData Lines',
    dataSettings: {
      dataSource: 'WASM',
      entitySet: 'UserData',
      chartAnnotation: {
        chartType: {
          type: 'Line'
        },
        dimensions: [
          {
            dimension: '[Country]',
            zeroSuppression: true
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'salary',
            formatting: {
              shortNumber: true
            }
          },
        ]
      },
      presentationVariant: {
        sortOrder: [
          {
            by: 'salary',
            order: OrderDirection.DESC
          }
        ]
      }
    },
    chartSettings: {
      locale: 'zh-Hans',
      digitsInfo: '0.3',
      universalTransition: true,
      chartTypes: [
        {
          name: 'Horizontal Bar',
          type: 'Bar',
          orient: ChartOrient.horizontal
        }
      ]
    },
    chartOptions: {
      dataZoom: {
        type: ChartDataZoomType.inside
      },
      categoryAxis: {
        axisLabel: {
          interval: 0,
          rotate: -90,
          hideOverlap: true,
          align: 'left'
        }
      }
    } as ChartOptions
  },

  {
    title: 'Line: MarkPoints',
    dataSettings: {
      dataSource: 'WASM',
      entitySet: 'UserData',
      chartAnnotation: {
        chartType: {
          type: 'Line'
        },
        dimensions: [
          {
            dimension: '[Country]',
            zeroSuppression: true
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'salary',
            formatting: {
              shortNumber: true,
              digitsInfo: '0.2-2',
            },
            referenceLines: [
              {
                label: '最大值',
                type: ReferenceLineType.markPoint,
                aggregation: ReferenceLineAggregation.max,
                valueType: ReferenceLineValueType.dynamic,
                chartOptions: {
                  itemStyle: {
                    color: 'blue'
                  }
                }
              },
              {
                label: '最小值',
                type: ReferenceLineType.markPoint,
                aggregation: ReferenceLineAggregation.min,
                valueType: ReferenceLineValueType.dynamic,
                chartOptions: {
                  itemStyle: {
                    color: 'red'
                  }
                }
              }
            ],
            chartOptions: {
              seriesStyle: {
                areaStyle: {},
                markPoint: {
                  itemStyle: {
                    color: 'grey'
                  }
                }
              }
            }
          }
        ]
      }
    },
    chartSettings: {
      locale: 'zh-Hans',
      digitsInfo: '0.3',
      universalTransition: true,
      chartTypes: [
        {
          name: 'Horizontal Bar',
          type: 'Bar',
          orient: ChartOrient.horizontal,
          chartOptions: {
            seriesStyle: {
              colorBy: 'data'
            }
          }
        }
      ]
    },
    chartOptions: {
      grid: {
        top: 30
      },
      dataZoom: {
        type: ChartDataZoomType.inside
      },
      categoryAxis: {
        axisLabel: {
          interval: 0,
          rotate: -90,
          hideOverlap: true,
          align: 'left'
        }
      },
      seriesStyle: {
        markPoint: {

        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          animation: false,
          label: {
            backgroundColor: '#505765'
          }
        }
      },
    } as ChartOptions
  },

  {
    title: 'Line: Sales and Cost',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Line'
        },
        dimensions: [
          {
            dimension: '[Time]',
            level: '[Time].[Month]'
          }
        ],
        measures: [
          {
            dimension: C_MEASURES,
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
              },
            ],
            chartOptions: {
              axis: {
                name: 'Sales($)'
              },
              seriesStyle: {
                markArea: {
                  data: [
                    [
                      {
                        yAxis: 50000,
                      },
                      {
                        yAxis: 100000,
                      }
                    ]
                  ]
                }
              }
            } as any
          },
          {
            dimension: 'Measures',
            measure: 'Cost',
            role: ChartMeasureRoleType.Axis2,
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
              }
            ],
            chartOptions: {
              axis: {
                name: 'Cost($)',
                nameLocation: 'start',
                alignTicks: true,
                inverse: true
              },
              seriesStyle: {
                areaStyle: {
                }
              }
            }
          }
        ]
      } as ChartAnnotation
    },
    chartSettings: {},
    chartOptions: {
      animationDuration: 10000,
      grid: {
        top: 30
      },
      seriesStyle: {
        selectedMode: 'single'
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
      },
    } as ChartOptions
  },
  
  {
    title: 'Line: GDP Lines',
    dataSettings: {
      dataSource: 'WASM',
      entitySet: 'CountryGDP',
      chartAnnotation: {
        chartType: {
          type: 'Line'
        },
        dimensions: [
          {
            dimension: '[Time]',
            level: '[Time].[Year]',
          },
          {
            dimension: '[Country]',
            role: ChartDimensionRoleType.Group
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
      } as ChartAnnotation,
    },
    chartSettings: {
      locale: 'zh-Hans',
      digitsInfo: '0.3',
      universalTransition: true,
    },
    chartOptions: {
      animationDuration: 10000,
      grid: {
        right: 140
      },
      dataZoom: {
        type: ChartDataZoomType.inside
      },
      categoryAxis: {
        axisLabel: {
          interval: 0,
          rotate: -90,
          hideOverlap: true,
          align: 'left'
        },
        axisTick: {
          show: true,
          interval: 'auto',
          alignWithLabel: true,
          lineStyle: {
            color: 'grey'
          }
        }
      },
      seriesStyle: {
        showSymbol: false,
        endLabel: {
          show: true,
        },
        labelLayout: {
          // moveOverlap: 'shiftY',
          hideOverlap: true
        },
        emphasis: {
          focus: 'series'
        },
      },
      tooltip: {
        order: 'valueDesc',
        trigger: 'axis'
      },
    } as ChartOptions
  }
]
