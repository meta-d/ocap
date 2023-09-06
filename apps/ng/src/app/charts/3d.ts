import { ChartAnnotation, ChartOptions, ChartSettings } from '@metad/ocap-core'

const d3Chart = {
  title: '3 D',
  dataSettings: {
    dataSource: 'FOODMART',
    entitySet: 'Sales',
    chartAnnotation: {
      chartType: {
        type: 'Bar3D'
      },
      dimensions: [
        {
          dimension: '[Store]',
          level: '[Store].[State]'
        },
        {
          dimension: '[Time]',
          level: '[Time].[Quarter]'
        }
      ],
      measures: [
        {
          dimension: 'Measures',
          measure: 'Sales',
          palette: {
            name: 'PuOr'
          },
          formatting: {
            shortNumber: true
          },
          chartOptions: {
            axis: {
              name: '销售额'
            },
            visualMap: {
              show: true,
              right: 0
            },
            seriesStyle: {
              stack: 'A',
            }
          }
        },
        {
          dimension: 'Measures',
          measure: 'Cost',
          chartOptions: {
            seriesStyle: {
              stack: 'A',
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
        type: 'Bar3D'
      },
      {
        type: 'Scatter3D'
      },
      {
        type: 'Line3D'
      }
    ]
  } as ChartSettings,
  chartOptions: {
    grid3D: {
      boxWidth: 80,
      boxDepth: 80,
      light: {
        main: {
          intensity: 1.2
        },
        ambient: {
          intensity: 0.7
        }
      },
      viewControl: {
        rotateSensitivity: 1,
      autoRotate: true
      }
      
    },
    seriesStyle: {
      selectedMode: 'single',
      shading: 'color',
      bevelSize: .5,
      itemStyle: {
        opacity: 0.7
      },
      emphasis: {
        label: {
          fontSize: 20,
          color: '#900'
        },
        itemStyle: {
          opacity: 1,
          color: '#900'
        }
      }
    },
    tooltip: {
      position: {right: 10, top: 10},
      appendToBody: true,
      // alwaysShowContent: true
    },
    legend: {},
    visualMaps: {},
    title: {
      text: '门店季度销售额',
      link : 'https://mtda.cloud',
      subtext: '数据来源于公司经营数据',
    },
  } as ChartOptions
}

export const D3Charts = [
  d3Chart,
  {
    ...d3Chart,
    title: 'Scatter3D',
    dataSettings: {
      ...d3Chart.dataSettings,
      chartAnnotation: {
        ...d3Chart.dataSettings.chartAnnotation,
        chartType: {
          type: 'Scatter3D'
        }
      }
    },
    chartOptions: {
      ...d3Chart.chartOptions,
      seriesStyle: {
        symbol: 'triangle',
        itemStyle: {
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.8)'
        },
        emphasis: {
          itemStyle: {
            color: '#fff'
          }
        }
      }
    }
  },
  {
    ...d3Chart,
    title: 'Line3D',
    dataSettings: {
      ...d3Chart.dataSettings,
      chartAnnotation: {
        ...d3Chart.dataSettings.chartAnnotation,
        chartType: {
          type: 'Line3D'
        }
      }
    }
  }
]
