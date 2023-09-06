import { ChartAnnotation, ChartMeasureRoleType, ChartOptions } from '@metad/ocap-core'

export const DrillDimensions = [
  {
    title: 'Sales and Cost',
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
            measure: 'Sales'
          },
          {
            dimension: 'Measures',
            measure: 'Cost',
            role: ChartMeasureRoleType.Axis2
          }
        ]
      } as ChartAnnotation,
      presentationVariant: {
        groupBy: [
          {
            dimension: '[Store]',
            level: '[Store].[State]'
          }
        ]
      }
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
