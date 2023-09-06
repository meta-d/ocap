import { ChartDimensionRoleType } from "@metad/ocap-core";

export const TrellisCharts = [
{
    title: 'Covid19Daily Trellis',
    dataSettings: {
      dataSource: 'Covid19',
      entitySet: 'Covid19Daily',
      chartAnnotation: {
        chartType: {
          type: 'Bar'
        },
        dimensions: [
          {
            dimension: '[Country Region]'
          },
          {
            dimension: '[Country]',
            hierarchy: '[Country]',
            level: '[Country].[Region]',
            role: ChartDimensionRoleType.Trellis
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Confirmed',
            palette: {
              name: 'PuOr'
            },
            formatting: {
              shortNumber: true
            }
          },
          {
            dimension: 'Measures',
            measure: 'Deaths'
            // role: ChartMeasureRoleType.Size
          }
        ]
      }
    },
    chartSettings: {
      // universalTransition: true,
      chartTypes: [
        {
          type: 'Line'
        }
      ]
    }
  }
]
