import {
  ChartDimensionRoleType,
  ChartAnnotation,
  ChartOptions,
  ChartMeasureRoleType,
  C_MEASURES
} from '@metad/ocap-core'

export const IndicatorCharts = [
  {
    title: 'Indicator: Sales of product ADJ',
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
            measure: 'I1',
            chartOptions: {
              axis: {
                name: 'Sales($)'
              },
              seriesStyle: {
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
      seriesStyle: {
        selectedMode: 'single'
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        show: true
      }
    } as ChartOptions
  },

  {
    title: 'Indicator: cost of product ADJ',
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
            measure: 'I2',
            chartOptions: {
              axis: {
                name: 'Sales($)'
              },
              seriesStyle: {
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
      seriesStyle: {
        selectedMode: 'single'
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        show: true
      }
    } as ChartOptions
  },

  {
    title: 'Indicator: sales and profit of product ADJ',
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
            measure: 'I1',
            chartOptions: {
              seriesStyle: {
              }
            }
          },
          {
            dimension: 'Measures',
            measure: 'I2',
            chartOptions: {
              seriesStyle: {
                stack: 'A'
              }
            }
          },
          {
            dimension: 'Measures',
            measure: 'I3',
            chartOptions: {
              axis: {
                name: 'Sales($)'
              },
              seriesStyle: {
                stack: 'A'
              }
            } as any
          },
          {
            dimension: 'Measures',
            measure: 'I4',
            role: ChartMeasureRoleType.Axis2,
            shapeType: 'line',
            chartOptions: {
              axis: {
                name: '%'
              },
              seriesStyle: {
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
      seriesStyle: {
        selectedMode: 'single'
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        show: true
      }
    } as ChartOptions
  },

  {
    title: 'Indicators Table',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      analytics: {
        rows: [
          {
            dimension: '[Store]',
            level: '[Store].[City]',
            displayHierarchy: true
          }
        ],
        columns: [
          {
            dimension: '[Time]',
            hierarchy: '[Time]',
            level: '[Time].[Month]',
            displayHierarchy: true,
            members: [
              { value: '[2021].[Q2].[June]', label: '2021 June' }
            ]
          },
          {
            dimension: C_MEASURES,
            members: ['I1', 'I2', 'I3', 'I4']
          }
        ]
      }
    },
    columns: {
    },
    options: {
      showToolbar: true,
      grid: true,
      sortable: true,
      initialRowLevel: 2,
      initialColumnLevel: 2,
      selectable: true
      // sticky: true
    }
  },
]
