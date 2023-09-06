import { cloneDeep, C_MEASURES } from '@metad/ocap-core'

const Sunburst = {
  title: 'Sunburst',
  dataSettings: {
    dataSource: 'FOODMART',
    entitySet: 'Sales',
    chartAnnotation: {
      chartType: {
        type: 'Sunburst'
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
          formatting: {
            shortNumber: true
          }
        }
      ]
    }
  },
  chartSettings: {
    universalTransition: true,
    locale: 'zh-Hans'
  },
  chartOptions: {
    seriesStyle: {
      emphasis: {
        focus: 'ancestor',
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.8)'
        }
      },
      label: {
        minAngle: '10'
      },
      levels: [
        {},
        {
          r0: '15%',
          r: '35%',
          itemStyle: {
            borderWidth: 2
          },
          label: {
            rotate: 'tangential'
          }
        },
        {
          r0: '35%',
          r: '70%',
          label: {
            align: 'right'
          }
        },
        {
          r0: '70%',
          r: '72%',
          label: {
            position: 'outside',
            padding: 3,
            silent: false
          },
          itemStyle: {
            borderWidth: 3
          }
        }
      ]
    },
    legend: {
      show: true,
      type: 'scroll'
    }
  }
}

const SunburstLeveled = {
  title: 'Sunburst: leveled hierarchy',
  dataSettings: {
    dataSource: 'FOODMART',
    entitySet: 'Sales',
    chartAnnotation: {
      chartType: {
        type: 'Sunburst'
      },
      dimensions: [
        {
          dimension: '[Time]',
          level: '[Time].[Year]'
        },
        {
          dimension: '[Store]',
          level: '[Store].[Country]'
        }
      ],
      measures: [
        {
          dimension: 'Measures',
          measure: 'Sales',
          formatting: {
            shortNumber: true
          }
        }
      ]
    }
  },
  chartSettings: {
    universalTransition: true,
    locale: 'zh-Hans'
  },
  chartOptions: {
    seriesStyle: {
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.8)'
        }
      },
      label: {
        minAngle: '10'
      },
    },
    legend: {
      show: true,
      type: 'scroll'
    }
  }
}

export const SunburstCharts = [
  Sunburst,
  SunburstLeveled
]

const SunburstWithMeasures = cloneDeep(SunburstLeveled)
SunburstWithMeasures.dataSettings.chartAnnotation.measures.push({
  dimension: C_MEASURES,
  measure: 'Profit',
  formatting: {
    shortNumber: true
  }
})
SunburstCharts.push({
  ...SunburstWithMeasures,
  title: 'Sunburst: with measures'
})
