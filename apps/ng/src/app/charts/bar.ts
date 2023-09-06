import { formatNumber } from '@angular/common'
import {
  ChartAnnotation,
  ChartDataZoomType,
  ChartDimensionRoleType,
  ChartMeasureRoleType,
  ChartOptions,
  OrderDirection,
  ReferenceLineAggregation,
  ReferenceLineType,
  ReferenceLineValueType
} from '@metad/ocap-core'
import { totalMeasureName } from '@metad/ocap-echarts'

export const BarCharts = [
  {
    title: 'Bar: Stacked',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Bar'
        },
        dimensions: [
          {
            dimension: '[Time]',
            level: '[Time].[Month]',
            order: OrderDirection.ASC,
            chartOptions: {
              dataZoom: {
                type: 'inside'
              }
            }
          },
          {
            dimension: '[Store]',
            level: '[Store].[Country]',
            role: ChartDimensionRoleType.Stacked
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Sales',
            order: OrderDirection.DESC,
            // referenceLines: [
            //   {
            //     label: '最大值',
            //     type: ReferenceLineType.markPoint,
            //     aggregation: ReferenceLineAggregation.max,
            //     valueType: ReferenceLineValueType.dynamic
            //   },
            //   {
            //     label: '最小值',
            //     type: ReferenceLineType.markPoint,
            //     aggregation: ReferenceLineAggregation.min,
            //     valueType: ReferenceLineValueType.dynamic
            //   },
            //   {
            //     label: '阈值',
            //     type: ReferenceLineType.markLine,
            //     valueType: ReferenceLineValueType.fixed,
            //     value: 100000
            //   }
            // ],
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
                },
                label: {
                  show: true,
                  position: 'inside',
                  formatter: (params) => {
                    const totalIndex = params.dimensionNames.indexOf(totalMeasureName('Sales'))
                    return formatNumber(params.data[params.seriesIndex + 1] / params.data[totalIndex] * 100, 'en', '0.1-1') + '%'
                  }
                },
              },
              visualMap: {
              },
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
      // grid: {
      //   top: 30
      // },
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
  },
  {
    title: 'Bar: Sales and Cost',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Bar'
        },
        dimensions: [
          {
            dimension: '[Time]',
            level: '[Time].[Month]'
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
                areaStyle: {}
              },
              visualMap: {
                show: true,
                type: 'piecewise',
                pieces: [
                  { "gt": 30000, "lte": 100000, "color": "green" },
                  { "lte": 30000, "color": "red" }
                ]
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
        selectedMode: 'single',
        label: {
          show: true,
          position: 'top',
          formatter: (params) => {
            return formatNumber(params.data['Sales'] / params.data[totalMeasureName('Sales') ] * 100, 'en', '0.1-1') + '%'
          }
        },
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
  }
]
