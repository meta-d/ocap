import { ChartAnnotation, ChartOptions, cloneDeep } from '@metad/ocap-core'

const TreemapChart = {
  title: 'Treemap',
  dataSettings: {
    dataSource: 'FOODMART',
    entitySet: 'Sales',
    chartAnnotation: {
      chartType: {
        type: 'Treemap'
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
          palette: {
            colors: [
              'rgb(142, 1, 82)',
              'rgb(170, 16, 105)',
              'rgb(194, 41, 128)',
              'rgb(211, 80, 153)',
              'rgb(223, 122, 178)',
              'rgb(234, 158, 201)',
              'rgb(242, 187, 219)',
              'rgb(248, 210, 232)',
              'rgb(250, 227, 240)',
              'rgb(248, 239, 242)',
              'rgb(242, 245, 233)',
              'rgb(231, 244, 213)',
              'rgb(214, 238, 183)',
              'rgb(190, 226, 146)',
              'rgb(163, 211, 109)',
              'rgb(134, 191, 77)',
              'rgb(106, 170, 53)',
              'rgb(81, 148, 38)',
              'rgb(59, 124, 30)',
              'rgb(39, 100, 25)'
            ]
          },
          chartOptions: {
            visualMap: {
              right: 0
            },
            seriesStyle: {
              name: '销售'
            }
          }
        },
        {
          dimension: 'Measures',
          measure: 'Profit',
          palette: {
            colors: [
              'rgb(142, 1, 82)',
              'rgb(170, 16, 105)',
              'rgb(194, 41, 128)',
              'rgb(211, 80, 153)',
              'rgb(223, 122, 178)',
              'rgb(234, 158, 201)',
              'rgb(242, 187, 219)',
              'rgb(248, 210, 232)',
              'rgb(250, 227, 240)',
              'rgb(248, 239, 242)',
              'rgb(242, 245, 233)',
              'rgb(231, 244, 213)',
              'rgb(214, 238, 183)',
              'rgb(190, 226, 146)',
              'rgb(163, 211, 109)',
              'rgb(134, 191, 77)',
              'rgb(106, 170, 53)',
              'rgb(81, 148, 38)',
              'rgb(59, 124, 30)',
              'rgb(39, 100, 25)'
            ]
          },
          chartOptions: {
            visualMap: {
              right: 0
            },
            seriesStyle: {
              name: '利润'
            }
          }
        }
      ]
    } as ChartAnnotation
  },
  chartSettings: {
    universalTransition: true,
    chartTypes: [
      {
        type: 'Sunburst'
      }
    ]
  },
  chartOptions: {
    grid: {
      top: 30,
      right: 100
    },
    seriesStyle: {
      top: 50,
      leafDepth: 2,
      levels: [
        {
          itemStyle: {
            borderWidth: 0,
            gapWidth: 5
          },
          color: [
            'rgb(142, 1, 82)',
            'rgb(170, 16, 105)',
            'rgb(194, 41, 128)',
            'rgb(211, 80, 153)',
            'rgb(223, 122, 178)',
            'rgb(234, 158, 201)',
            'rgb(242, 187, 219)',
            'rgb(248, 210, 232)',
            'rgb(250, 227, 240)',
            'rgb(248, 239, 242)',
            'rgb(242, 245, 233)',
            'rgb(231, 244, 213)',
            'rgb(214, 238, 183)',
            'rgb(190, 226, 146)',
            'rgb(163, 211, 109)',
            'rgb(134, 191, 77)',
            'rgb(106, 170, 53)',
            'rgb(81, 148, 38)',
            'rgb(59, 124, 30)',
            'rgb(39, 100, 25)'
          ],
          colorMappingBy: 'value'
        },
        {
          itemStyle: {
            gapWidth: 1
          }
        },
        {
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

const LeveledHierarchy = {
  title: 'Treemap: leveled hierarchy',
  dataSettings: {
    dataSource: 'FOODMART',
    entitySet: 'Sales',
    chartAnnotation: {
      chartType: {
        type: 'Treemap'
      },
      dimensions: [
        {
          dimension: '[Time]',
          level: '[Time].[Year]',
          chartOptions: {
            seriesStyle: {
              itemStyle: {
                borderWidth: 0,
                gapWidth: 5
              },
            }
          }
        },
        {
          dimension: '[Store]',
          level: '[Store].[State]',
          chartOptions: {
            seriesStyle: {
              // colorSaturation: [0.35, 0.5],
              // color: [
              //   'rgb(142, 1, 82)',
              //   'rgb(170, 16, 105)',
              //   'rgb(194, 41, 128)',
              //   'rgb(211, 80, 153)',
              //   'rgb(223, 122, 178)',
              //   'rgb(234, 158, 201)',
              //   'rgb(242, 187, 219)',
              //   'rgb(248, 210, 232)',
              //   'rgb(250, 227, 240)',
              //   'rgb(248, 239, 242)',
              //   'rgb(242, 245, 233)',
              //   'rgb(231, 244, 213)',
              //   'rgb(214, 238, 183)',
              //   'rgb(190, 226, 146)',
              //   'rgb(163, 211, 109)',
              //   'rgb(134, 191, 77)',
              //   'rgb(106, 170, 53)',
              //   'rgb(81, 148, 38)',
              //   'rgb(59, 124, 30)',
              //   'rgb(39, 100, 25)'
              // ],
              // colorMappingBy: 'value',
              itemStyle: {
                gapWidth: 1,
                borderColor: '#555',
                borderWidth: 5
              },
              upperLabel: {
                show: true
              }
            }
          }
        }
      ],
      measures: [
        {
          dimension: 'Measures',
          measure: 'Sales',
          formatting: {
            shortNumber: true
          },
          palette: {
            colors: [
              'rgb(142, 1, 82)',
              'rgb(170, 16, 105)',
              'rgb(194, 41, 128)',
              'rgb(211, 80, 153)',
              'rgb(223, 122, 178)',
              'rgb(234, 158, 201)',
              'rgb(242, 187, 219)',
              'rgb(248, 210, 232)',
              'rgb(250, 227, 240)',
              'rgb(248, 239, 242)',
              'rgb(242, 245, 233)',
              'rgb(231, 244, 213)',
              'rgb(214, 238, 183)',
              'rgb(190, 226, 146)',
              'rgb(163, 211, 109)',
              'rgb(134, 191, 77)',
              'rgb(106, 170, 53)',
              'rgb(81, 148, 38)',
              'rgb(59, 124, 30)',
              'rgb(39, 100, 25)'
            ]
          },
          chartOptions: {
            visualMap: {
              right: 0
            },
            seriesStyle: {
              label: {
                formatter: '名称:{name|{name}}\n值:{value|{value}} {unit|{unit}}'
              }
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
      leafDepth: 2,
      levels: [],
    },
    tooltip: {},
    legend: {}
  } as ChartOptions
}

export const TreemapCharts = [
  TreemapChart,
  LeveledHierarchy,
]

const leveledHierarchyMeasures = cloneDeep(LeveledHierarchy)
leveledHierarchyMeasures.dataSettings.chartAnnotation.measures.push({
  dimension: 'Measures',
  measure: 'Profit',
  chartOptions: {
    visualMap: {
      right: 0
    },
    seriesStyle: {
      name: '利润'
    }
  }
})
TreemapCharts.push({
  ...leveledHierarchyMeasures,
  title: 'Treemap: leveled hierarchy with Measures',
})
