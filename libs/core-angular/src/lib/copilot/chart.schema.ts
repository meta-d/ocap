import {
  BarVariant,
  ChartAnnotation,
  ChartDimensionRoleType,
  ChartMeasureRoleType,
  ChartOrient,
  ChartType,
  OrderDirection,
  PieVariant,
  pick
} from '@metad/ocap-core'
import { z } from 'zod'
import { DeepPartial } from '../helpers'
import { NxChartType } from '../smart-chart'
import { BaseMeasureSchema, DimensionSchema, MeasureSchema } from './cube.schema'

export function makeChartRulesPrompt() {
  return ``
}

export function makeChartEnum() {
  return CHARTS.map((g) => g.charts.map((c) => c.label)).flat()
}

export function makeChartSchema() {
  return z
    .object({
      cube: z.string().describe('The cube name used by the chart'),
      chartType: z.object({
        type: z.enum(makeChartEnum() as unknown as z.EnumValues).describe('The chart type'),
        chartOptions: z
          .object({
            seriesStyle: z.any().describe('The series options of ECharts library'),
            legend: z.any().describe('The legend options of ECharts library'),
            axis: z.any().describe('The axis options of ECharts library'),
            dataZoom: z.any().describe('The dataZoom options of ECharts library'),
            tooltip: z.any().describe('The tooltip options of ECharts library')
          })
          .describe('The chart options of ECharts library')
      }),
      // dimensions: z
      //   .array(
      //     z.object({
      //       dimension: z.string().describe('The name of dimension'),
      //       hierarchy: z.string().optional().describe('The name of the hierarchy in the dimension'),
      //       level: z.string().optional().describe('The name of the level in the hierarchy')
      //     })
      //   )
      //   .describe('The dimensions used by the chart, at least one dimension'),
      // measures: z
      //   .array(
      //     z.object({
      //       measure: z.string().describe('The name of the measure'),
      //       order: z.enum(['ASC', 'DESC']).optional().describe('The order of the measure'),
      //       chartOptions: z.any().optional().describe('The chart options of ECharts library')
      //     })
      //   )
      //   .describe('The measures used by the chart, At least one measure'),
      slicers: z
        .array(
          z.object({
            dimension: z
              .object({
                dimension: z.string().describe('The name of the dimension'),
                hierarchy: z.string().optional().describe('The name of the hierarchy in the dimension'),
                level: z.string().optional().describe('The name of the level in the hierarchy')
              })
              .describe('The dimension of the slicer'),
            members: z
              .array(
                z.object({
                  value: z.string().describe('the key of the member'),
                  caption: z.string().describe('the caption of the member')
                })
              )
              .describe('The members in the slicer')
          })
        )
        .describe('The slicers used by the chart')
    })
    .describe('The chart schema')
}

export function makeChartDimensionSchema() {
  return DimensionSchema
}

export function makeChartMeasureSchema() {
  return MeasureSchema
}

export interface ChartGroup {
  label: string
  charts: { label: string; icon: string; rotate?: boolean; width?: string; value: DeepPartial<ChartAnnotation> }[]
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
            orient: ChartOrient.horizontal,
            variant: BarVariant.None
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
            orient: ChartOrient.vertical,
            variant: BarVariant.None
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
            variant: BarVariant.Stacked
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
            variant: BarVariant.Stacked
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
            variant: BarVariant.Polar,
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
            variant: BarVariant.Polar,
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
            variant: BarVariant.Polar,
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
            variant: BarVariant.None,
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
            variant: BarVariant.None,
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
            variant: BarVariant.None,
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
            variant: PieVariant.None,
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
            variant: PieVariant.Doughnut,
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
            variant: PieVariant.Doughnut,
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
            variant: PieVariant.Nightingale,
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
            variant: PieVariant.Nightingale,
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
        (chartType?.orient
          ? chart.value.chartType.orient === chartType?.orient
          : chart.value.chartType.orient
          ? chart.value.chartType.orient === ChartOrient.vertical
          : true)
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

export const ChartMeasureSchema = z.object({
  ...BaseMeasureSchema,
  role: z.enum([null, 'Axis1', 'Axis2']).optional().describe('Role of value axis')
})

export const OrderBySchema = z.object({
  by: z.string().describe('Field to order by'),
  order: z.enum([OrderDirection.ASC, OrderDirection.DESC]).describe('Order direction')
})
