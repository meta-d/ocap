import { DeepPartial, NxChartType } from '@metad/core'
import {
  ChartAnnotation,
  ChartDimensionRoleType,
  ChartMeasureRoleType,
  ChartOrient,
  ChartType,
  pick
} from '@metad/ocap-core'

export interface ChartGroup {
  label: string
  charts: { label: string; icon: string; rotate?: boolean; width?: string; value: DeepPartial<ChartAnnotation> }[]
}

export enum ChartMainTypeEnum {
  Bar = NxChartType.Bar,
  Pie = NxChartType.Pie,
  Waterfall = NxChartType.Waterfall,
  Line = NxChartType.Line,
  ThemeRiver = NxChartType.ThemeRiver,
  Scatter = NxChartType.Scatter,
  Heatmap = NxChartType.Heatmap,
  Boxplot = NxChartType.Boxplot,
  Tree = NxChartType.Tree,
  Treemap = NxChartType.Treemap,
  Sunburst = NxChartType.Sunburst,
  Sankey = NxChartType.Sankey,
  Funnel = NxChartType.Funnel,
  Radar = NxChartType.Radar,
  GeoMap = NxChartType.GeoMap,
  Bar3D = NxChartType.Bar3D,
  Line3D = NxChartType.Line3D,
  Scatter3D = NxChartType.Scatter3D,
  Custom = NxChartType.Custom
}

export const CHARTS: ChartGroup[] = [
  {
    label: 'Comparison',
    charts: [
      {
        label: NxChartType.Bar,
        icon: 'bar.svg',
        value: {
          chartType: {
            type: NxChartType.Bar,
            orient: ChartOrient.horizontal
          },
          dimensions: [{}],
          measures: [{}]
        }
      },
      {
        label: NxChartType.Column,
        icon: 'column.svg',
        value: {
          chartType: {
            type: NxChartType.Bar,
            orient: ChartOrient.vertical
          },
          dimensions: [{}],
          measures: [{}]
        }
      },
      {
        label: NxChartType.ColumnStacked,
        value: {
          chartType: {
            type: NxChartType.Bar,
            orient: ChartOrient.vertical,
            variant: 'stacked'
          },
          dimensions: [
            {},
            {
              role: ChartDimensionRoleType.Stacked
            }
          ],
          measures: [{}]
        },
        icon: 'column-stacked.svg'
      },
      {
        label: NxChartType.BarStacked,
        value: {
          chartType: {
            type: NxChartType.Bar,
            orient: ChartOrient.horizontal,
            variant: 'stacked'
          },
          dimensions: [
            {},
            {
              role: ChartDimensionRoleType.Stacked
            }
          ],
          measures: [{}]
        },
        icon: 'column-stacked.svg',
        rotate: true
      },
      {
        label: NxChartType.BarPolar,
        value: {
          chartType: {
            type: NxChartType.Bar,
            orient: ChartOrient.horizontal,
            variant: 'polar',
            chartOptions: {
              seriesStyle: {
                colorBy: 'data',
                roundCap: true
              }
            }
          },
          dimensions: [{}],
          measures: [{}]
        },
        icon: 'bar-polar.svg'
      },
      {
        label: NxChartType.BarPolar + 'Background',
        value: {
          chartType: {
            type: NxChartType.Bar,
            orient: ChartOrient.horizontal,
            variant: 'polar',
            chartOptions: {
              seriesStyle: {
                colorBy: 'data',
                roundCap: true,
                showBackground: true,
                backgroundStyle: {}
              }
            }
          },
          dimensions: [{}],
          measures: [{}]
        },
        icon: 'bar-polar-bg.svg'
      },
      {
        label: NxChartType.ColumnPolar,
        value: {
          chartType: {
            type: NxChartType.Bar,
            orient: ChartOrient.vertical,
            variant: 'polar',
            chartOptions: {
              seriesStyle: {
                colorBy: 'data',
                roundCap: true
              }
            }
          },
          dimensions: [{}],
          measures: [{}]
        },
        icon: 'column-polar-stacked.jpg'
      },
      {
        label: NxChartType.Histogram,
        value: {
          chartType: {
            type: NxChartType.Bar,
            orient: ChartOrient.vertical,
            chartOptions: {
              seriesStyle: {
                barWidth: '99.3%'
              }
            }
          },
          dimensions: [{}],
          measures: [{}]
        },
        icon: 'histogram.svg'
      },
      {
        label: NxChartType.Combination,
        value: {
          chartType: {
            type: NxChartType.Bar,
            orient: ChartOrient.vertical,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}],
          measures: [
            {},
            {
              role: ChartMeasureRoleType.Axis2,
              shapeType: 'line'
            }
          ]
        },
        icon: 'combination.svg',
        width: '50px'
      },
      {
        label: NxChartType.Bar + 'Trellis',
        value: {
          chartType: {
            type: NxChartType.Bar,
            orient: ChartOrient.vertical,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [
            {},
            {
              role: ChartDimensionRoleType.Trellis
            }
          ],
          measures: [{}]
        },
        icon: 'bar-trellis.svg'
      },
      {
        label: NxChartType.Pie,
        value: {
          chartType: {
            type: NxChartType.Pie,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}],
          measures: [{}]
        },
        icon: 'pie.svg'
      },
      {
        label: NxChartType.Doughnut,
        value: {
          chartType: {
            type: NxChartType.Pie,
            variant: 'Doughnut',
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}],
          measures: [{}]
        },
        icon: 'doughnut.svg'
      },
      {
        label: NxChartType.Doughnut + '2',
        value: {
          chartType: {
            type: NxChartType.Pie,
            variant: 'Doughnut',
            chartOptions: {
              seriesStyle: {
                radius: ['80%', '90%']
              }
            }
          },
          dimensions: [{}],
          measures: [{}]
        },
        icon: 'doughnut-2.svg'
      },
      {
        label: NxChartType.Nightingale,
        value: {
          chartType: {
            type: NxChartType.Pie,
            variant: 'Nightingale',
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}],
          measures: [{}]
        },
        icon: 'nightingale.svg'
      },
      {
        label: NxChartType.Nightingale + '2',
        value: {
          chartType: {
            type: NxChartType.Pie,
            variant: 'Nightingale',
            chartOptions: {
              seriesStyle: {
                radius: [0]
              }
            }
          },
          dimensions: [{}],
          measures: [{}]
        },
        icon: 'nightingale-2.svg'
      },
      {
        label: NxChartType.Waterfall,
        value: {
          chartType: {
            type: NxChartType.Waterfall,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}],
          measures: [{}]
        },
        icon: 'waterfall.svg',
        width: '40px'
      }
    ]
  },
  {
    label: 'Trend',
    charts: [
      {
        label: NxChartType.Line,
        icon: 'line.svg',
        width: '50px',
        value: {
          chartType: {
            type: NxChartType.Line,
            orient: ChartOrient.vertical
          },
          dimensions: [{}],
          measures: [{}]
        }
      },
      {
        label: NxChartType.Line + '2',
        icon: 'line.svg',
        width: '50px',
        value: {
          chartType: {
            type: NxChartType.Line,
            orient: ChartOrient.horizontal
          },
          dimensions: [{}],
          measures: [{}]
        },
        rotate: true
      },
      {
        label: NxChartType.Area,
        icon: 'area.svg',
        width: '50px',
        value: {
          chartType: {
            type: NxChartType.Line,
            orient: ChartOrient.vertical,
            chartOptions: {
              seriesStyle: {
                areaStyle: {}
              }
            }
          },
          dimensions: [{}],
          measures: [{}]
        }
      },
      {
        label: NxChartType.AreaStacked,
        icon: 'area-stacked.svg',
        width: '50px',
        value: {
          chartType: {
            type: NxChartType.Line,
            orient: ChartOrient.vertical,
            chartOptions: {
              seriesStyle: {
                areaStyle: {},
                stack: 'normal'
              }
            }
          },
          dimensions: [{}],
          measures: [{}, {}]
        }
      },
      {
        label: NxChartType.ThemeRiver,
        icon: 'theme-river.svg',
        width: '50px',
        value: {
          chartType: {
            type: NxChartType.ThemeRiver,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}],
          measures: [{}]
        }
      }
    ]
  },
  {
    label: 'Correlation',
    charts: [
      {
        label: NxChartType.Scatter,
        icon: 'scatter.svg',
        width: '40px',
        value: {
          chartType: {
            type: NxChartType.Scatter,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}],
          measures: [{}, {}]
        }
      },
      {
        label: NxChartType.Bubble,
        icon: 'bubble.svg',
        width: '40px',
        value: {
          chartType: {
            type: NxChartType.Scatter,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}],
          measures: [
            {},
            {},
            {
              role: ChartMeasureRoleType.Size
            }
          ]
        }
      },
      {
        label: NxChartType.Heatmap,
        icon: 'heatmap.svg',
        width: '40px',
        value: {
          chartType: {
            type: NxChartType.Heatmap,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}, {}],
          measures: [{}]
        }
      }
    ]
  },
  {
    label: 'Distribution',
    charts: [
      {
        label: NxChartType.Boxplot,
        icon: 'boxplot.png',
        width: '40px',
        value: {
          chartType: {
            type: NxChartType.Boxplot,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}, {}],
          measures: [{}]
        }
      },
      {
        label: NxChartType.Tree,
        icon: 'tree.svg',
        width: '40px',
        value: {
          chartType: {
            type: NxChartType.Tree,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [
            {
              displayHierarchy: true
            }
          ],
          measures: [{}]
        }
      },
      {
        label: NxChartType.Treemap,
        icon: 'tree-map.svg',
        width: '40px',
        value: {
          chartType: {
            type: NxChartType.Treemap,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [
            {
              displayHierarchy: true
            }
          ],
          measures: [{}]
        }
      },
      {
        label: NxChartType.Sunburst,
        icon: 'sunburst.svg',
        width: '40px',
        value: {
          chartType: {
            type: NxChartType.Sunburst,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [
            {
              displayHierarchy: true
            }
          ],
          measures: [{}]
        }
      },
      {
        label: NxChartType.Sankey,
        icon: 'sankey.svg',
        width: '40px',
        value: {
          chartType: {
            type: NxChartType.Sankey,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [
            {
              displayHierarchy: true
            }
          ],
          measures: [{}]
        }
      },
      {
        label: NxChartType.Funnel,
        icon: 'funnel.svg',
        width: '40px',
        value: {
          chartType: {
            type: NxChartType.Funnel,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [],
          measures: [{}, {}, {}]
        }
      },
      {
        label: NxChartType.Radar,
        icon: 'radar.jpg',
        value: {
          chartType: {
            type: NxChartType.Radar,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}],
          measures: [{}]
        }
      }
    ]
  },
  {
    label: 'Geo',
    charts: [
      {
        label: NxChartType.GeoMap,
        icon: 'geomap.svg',
        width: '40px',
        value: {
          chartType: {
            type: NxChartType.GeoMap,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}],
          measures: [{}]
        }
      }
    ]
  },
  {
    label: '3D',
    charts: [
      {
        label: NxChartType.Bar3D,
        icon: 'gl.svg',
        width: '60px',
        value: {
          chartType: {
            type: NxChartType.Bar3D,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}, {}, {}],
          measures: [{}]
        }
      },
      {
        label: NxChartType.Line3D,
        icon: 'gl.svg',
        width: '60px',
        value: {
          chartType: {
            type: NxChartType.Line3D,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}, {}, {}],
          measures: [{}]
        }
      },
      {
        label: NxChartType.Scatter3D,
        icon: 'gl.svg',
        width: '60px',
        value: {
          chartType: {
            type: NxChartType.Scatter3D,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}, {}, {}],
          measures: [{}]
        }
      }
    ]
  },
  {
    label: 'Custom',
    charts: [
      {
        label: NxChartType.Custom,
        icon: 'custom.svg',
        width: '40px',
        value: {
          chartType: {
            type: NxChartType.Custom,
            chartOptions: {
              seriesStyle: {}
            }
          },
          dimensions: [{}],
          measures: [{}]
        }
      }
    ]
  }
]

/**
 * Find Chart Type by type/variant/orient
 * @param chartType
 * @returns
 */
export function getChartType(chartType: ChartType | string) {
  if (typeof chartType === 'string') {
    for (const group of CHARTS) {
      for (const chart of group.charts) {
        if (chart.label === chartType) {
          return chart
        }
      }
    }

    throw new Error(`Chart Type ${chartType} not found`)
  }

  for (const group of CHARTS) {
    for (const chart of group.charts) {
      if (
        chart.value.chartType.type === chartType?.type &&
        (chartType?.variant ? chart.value.chartType.variant === chartType?.variant : true) &&
        (chartType?.orient ? chart.value.chartType.orient === chartType?.orient : 
          chart.value.chartType.orient ? chart.value.chartType.orient === ChartOrient.vertical :
            true)
      ) {
        return chart
      }
    }
  }

  if (chartType?.variant || chartType?.orient) {
    return getChartType(pick(chartType, 'type') as ChartType)
  }

  throw new Error(`Chart Type ${chartType?.type}/${chartType?.orient}/${chartType?.variant} not found`)
}
