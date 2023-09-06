import { ChartAnnotation, ChartDimensionRoleType, ChartOrient, OrderDirection } from '@metad/ocap-core'

export const PieCharts = [
  {
    title: 'Pie: Unemployment by State',
    dataSettings: {
      dataSource: 'UnemploymentModel',
      entitySet: 'Unemployment Rate',
      chartAnnotation: {
        chartType: {
          type: 'Pie',
          variant: 'Nightingale'
        },
        dimensions: [
          {
            dimension: '[Region]',
            level: '[Region].[State]'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Rate',
            palette: {
              name: 'Viridis'
            },
            order: OrderDirection.ASC,
            chartOptions: {
              visualMap: {
                show: true,
                calculable: true,
                left: 0,
                bottom: 0,
                orient: 'horizontal'
              }
            }
          }
        ]
      },
      selectionVariant: {
        selectOptions: [
          {
            dimension: {
              dimension: '[Calendar]'
            },
            members: [
              {
                value: '[2016].[February]'
              }
            ]
          }
        ]
      }
    },
    chartSettings: {
      universalTransition: true,
      chartTypes: [
        {
          type: 'Bar',
          orient: ChartOrient.horizontal
        },
        {
          type: 'GeoMap',
          map: 'USStates',
          mapUrl: 'https://unpkg.com/us-atlas@3/counties-10m.json',
          projection: 'AlbersUsa',
          isTopoJSON: true,
          features: 'states'
        }
      ]
    },
    chartOptions: {
      title: {
        text: 'Unemployment Rate of US (February 2016)',
        subtext: 'Data from kaggle',
        sublink: 'https://www.kaggle.com/datasets/jayrav13/unemployment-by-county-us'
      },
      animationDurationUpdate: 500,
      animationEasingUpdate: 'cubicOut',
      grid: {
        top: 50,
        bottom: 50
      },
      seriesStyle: {
        // TODO 为了平均相同的 feature name
        mapValueCalculation: 'average'
      },
      visualMaps: []
    }
  },
  {
    title: 'Pie: measures',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: <ChartAnnotation>{
        chartType: {
          type: 'Pie'
        },
        dimensions: [
          {
            dimension: '[Store]',
            level: '[Store].[Country]'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Sales',
            order: OrderDirection.DESC,
            palette: {
              name: 'Category10',
              pattern: 1
            },
            chartOptions: {
              seriesStyle: {
                label: {
                  show: true,
                  formatter: `{b} ({d}%)`,
                },
              }
            }
          },
          {
            dimension: 'Measures',
            measure: 'Profit',
            order: OrderDirection.DESC,
            palette: {
              pattern: 3
            }
          }
        ]
      },
    }
  },
  {
    title: 'Pie: Measures ans Trellis',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Pie'
        },
        dimensions: [
          {
            dimension: '[Store]',
            level: '[Store].[Country]'
          },
          {
            dimension: '[Time]',
            level: '[Time].[Year]',
            role: ChartDimensionRoleType.Trellis
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Sales',
            order: OrderDirection.DESC
          },
          {
            dimension: 'Measures',
            measure: 'Profit',
            order: OrderDirection.DESC
          }
        ]
      },
    }
  }
]
