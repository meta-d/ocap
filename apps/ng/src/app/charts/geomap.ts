import { ChartDataZoomType, ChartDimensionRoleType, ChartOptions, ChartOrient, OrderDirection } from "@metad/ocap-core";

export const GeomapCharts = [
    {
    title: 'Csse Covid-19 Daily',
    dataSettings: {
      dataSource: 'Covid19',
      entitySet: 'Covid19Daily',
      chartAnnotation: {
        chartType: {
          type: 'GeoMap',
          map: 'World',
          mapUrl: window.location.origin + '/assets/data/countries.geo.json', // `https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json`,
          projection: 'NaturalEarth1'
        },
        dimensions: [
          {
            dimension: '[Country]',
            level: '[Country].[Name]'
          },
          {
            dimension: 'Lat',
            role: ChartDimensionRoleType.Lat
          },
          {
            dimension: 'Long_',
            role: ChartDimensionRoleType.Long
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Confirmed',
            shapeType: 'scatter',
            formatting: {
              shortNumber: true
            }
          }
        ]
      },
      selectionVariant: {
        selectOptions: [
          {
            dimension: {
              dimension: '[Country]'
            },
            exclude: true,
            members: [
              {
                value: 'US'
              }
            ]
          }
        ]
      }
    },
    chartSettings: {},
    chartOptions: {}
  },
  {
    title: 'GeoJSON World: Airy',
    dataSettings: {
      dataSource: 'Covid19',
      entitySet: 'Covid19Daily',
      chartAnnotation: {
        chartType: {
          type: 'GeoMap',
          map: 'World',
          mapUrl: window.location.origin + '/assets/data/countries.geo.json', // `https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json`,
          // projection: 'NaturalEarth1'
          // projection: 'Airy'
          projection: 'Aitoff'
        },
        dimensions: [
          {
            dimension: '[Country]',
            level: '[Country].[Name]'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Confirmed',
            formatting: {
              shortNumber: true
            },
            palette: {
              color: [
                '#313695',
                '#4575b4',
                '#74add1',
                '#abd9e9',
                '#e0f3f8',
                '#ffffbf',
                '#fee090',
                '#fdae61',
                '#f46d43',
                '#d73027',
                '#a50026'
              ]
            },
            order: OrderDirection.ASC
          }
        ]
      },
      selectionVariant: {
        selectOptions: [
          {
            dimension: {
              dimension: '[Country]'
            },
            exclude: true,
            members: [
              {
                value: 'US'
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
        }
      ]
    },
    chartOptions: {
      dataZoom: {
        type: ChartDataZoomType.inside,
        orient: 'vertical'
      }
    }
  },
  {
    title: 'Map projection: AlbersUsa',
    dataSettings: {
      dataSource: 'Covid19',
      entitySet: 'Covid19Daily',
      chartAnnotation: {
        chartType: {
          type: 'GeoMap',
          map: 'USA',
          mapUrl: window.location.origin + '/assets/data/us-states.json', // `https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json`,
          projection: 'AlbersUsa'
        },
        dimensions: [
          {
            dimension: '[Country Region]',
            level: '[Country Region].[Province State]'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Confirmed',
            formatting: {
              shortNumber: true
            },
            order: OrderDirection.ASC,
            chartOptions: {
              seriesStyle: {
                showAllSymbol: true
              }
            }
          }
        ]
      },
      selectionVariant: {
        selectOptions: [
          {
            dimension: {
              dimension: '[Country Region]'
            },
            members: [
              {
                value: 'US'
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
          type: 'Line'
        }
      ]
    },
    chartOptions: {
      animationDurationUpdate: 500,
      animationEasingUpdate: 'cubicOut'
      // animationDelayUpdate: (idx: number) => idx * 10,
    }
  },
  {
    title: 'Csse Covid-19 Daily',
    dataSettings: {
      dataSource: 'Covid19',
      entitySet: 'Covid19Daily',
      chartAnnotation: {
        chartType: {
          type: 'GeoMap',
          map: 'USA',
          mapUrl: window.location.origin + '/assets/data/us-states.json'
        },
        dimensions: [
          {
            dimension: '[Country Region]',
            level: '[Country Region].[Province State]'
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Confirmed',
            formatting: {
              shortNumber: true
            }
          }
          // {
          //   dimension: 'Measures',
          //   measure: 'Deaths'
          // },
          // {
          //   dimension: 'Measures',
          //   measure: 'Case_Fatality_Ratio',
          //   role: ChartMeasureRoleType.Axis2,
          //   formatting: {
          //     unit: '%'
          //   }
          // }
        ]
      },
      selectionVariant: {
        selectOptions: [
          {
            dimension: {
              dimension: '[Country Region]'
            },
            members: [
              {
                value: 'US'
              }
            ]
          }
        ]
      },
      presentationVariant: {
        sortOrder: [
          {
            by: 'Confirmed',
            order: OrderDirection.ASC
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
        }
      ]
    },
    chartOptions: {
      animationDurationUpdate: 500,
      animationEasingUpdate: 'cubicIn',
      animationDelayUpdate: (idx: number) => idx * 10,
      dataZoom: {
        type: ChartDataZoomType.inside,
        orient: 'vertical'
      },
      visualMaps: [
        {
          show: true,
          calculable: true,
          left: 0,
          bottom: 0,
          orient: 'horizontal',
          formatter: `Confirmed: {value}`
        }
      ]
    } as ChartOptions
  },
]