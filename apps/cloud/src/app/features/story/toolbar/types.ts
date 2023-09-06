import { ChartAnnotation, ChartDimensionRoleType, ChartMeasureRoleType, ChartOrient } from '@metad/ocap-core'
import { DeepPartial, NxChartType } from '@metad/core'
import { StoryPoint, StoryPointType, WidgetComponentType } from '@metad/story/core'
import { DisplayGrid } from 'angular-gridster2'

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
            orient: ChartOrient.vertical
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
            orient: ChartOrient.horizontal
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
              seriesStyle: {
              }
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
        width: '50px',
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
              role: ChartDimensionRoleType.Trellis,
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

export const COMPONENTS: {
  code: string
  label: string
  icon: string
  value: {
    component: string
  }
}[] = [
  {
    code: 'FILTER_BAR',
    label: 'Filter Bar',
    icon: 'filter_alt',
    value: {
      component: WidgetComponentType.StoryFilterBar
    }
  },
  {
    code: 'Today',
    label: 'Today',
    icon: 'today',
    value: {
      component: WidgetComponentType.Today
    }
  },
  {
    code: 'Image',
    label: 'Image',
    icon: 'image',
    value: {
      component: WidgetComponentType.Image
    }
  },
  {
    code: 'Text',
    label: 'Text',
    icon: 'format_color_text',
    value: {
      component: WidgetComponentType.Text
    }
  },
  {
    code: 'Document',
    label: 'Document',
    icon: 'post_add',
    value: {
      component: WidgetComponentType.Document
    }
  },
  {
    code: 'Iframe',
    label: 'Iframe',
    icon: 'filter_frames',
    value: {
      component: WidgetComponentType.Iframe
    }
  },
  {
    code: 'Video',
    label: 'Video',
    icon: 'ondemand_video',
    value: {
      component: WidgetComponentType.Video
    }
  }
]

export const PAGES: {
  value: Partial<StoryPoint>
  label: string
  icon?: string
}[] = [
  {
    value: {
      type: StoryPointType.Canvas
    },
    label: 'Default Canvas',
    icon: 'canvas.svg'
  },
  {
    value: {
      type: StoryPointType.Canvas,
      gridOptions: {
        gridType: 'fit',
        setGridSize: false,
        displayGrid: DisplayGrid.OnDragAndResize,
        fixedColWidth: 10,
        fixedRowHeight: 10,
        rowHeightRatio: 1,
        minCols: 100,
        minRows: 70,
        maxCols: 100,
        maxRows: 70,
        allowMultiLayer: true
      }
    },
    label: 'Fit Screen (Dense)'
  },
  {
    value: {
      type: StoryPointType.Canvas,
      gridOptions: {
        gridType: 'fit',
        setGridSize: false,
        displayGrid: DisplayGrid.OnDragAndResize,
        fixedColWidth: 10,
        fixedRowHeight: 10,
        rowHeightRatio: 1,
        minCols: 30,
        minRows: 20,
        maxCols: 30,
        maxRows: 20,
        allowMultiLayer: true
      }
    },
    label: 'Fit Screen (Cosy)'
  },
  {
    value: {
      type: StoryPointType.Canvas,
      gridOptions: {
        gridType: 'fit',
        setGridSize: false,
        displayGrid: DisplayGrid.OnDragAndResize,
        fixedColWidth: 10,
        fixedRowHeight: 10,
        rowHeightRatio: 1,
        minCols: 15,
        minRows: 10,
        maxCols: 15,
        maxRows: 10,
        allowMultiLayer: true
      }
    },
    label: 'Fit Screen (Comfort)'
  },
  {
    value: {
      type: StoryPointType.Canvas,
      gridOptions: {
        gridType: 'fixed',
        setGridSize: true,
        displayGrid: DisplayGrid.OnDragAndResize,
        fixedColWidth: 10,
        fixedRowHeight: 10,
        rowHeightRatio: 1,
        minCols: 75,
        minRows: 46,
        maxCols: 75,
        maxRows: 46,
        outerMarginTop: 10,
        outerMarginRight: 10,
        outerMarginBottom: 10,
        outerMarginLeft: 10,
        allowMultiLayer: true
      }
    },
    label: 'Fixed Dense (MacBook Pro 14)'
  },
  {
    value: {
      type: StoryPointType.Canvas,
      gridOptions: {
        gridType: 'fixed',
        setGridSize: true,
        displayGrid: DisplayGrid.OnDragAndResize,
        fixedColWidth: 30,
        fixedRowHeight: 30,
        rowHeightRatio: 1,
        minCols: 37,
        minRows: 23,
        maxCols: 37,
        maxRows: 23,
        outerMarginTop: 10,
        outerMarginRight: 10,
        outerMarginBottom: 10,
        outerMarginLeft: 10,
        allowMultiLayer: true
      }
    },
    label: 'Fixed Cosy (MacBook Pro 14)'
  },
  {
    value: {
      type: StoryPointType.Canvas,
      gridOptions: {
        gridType: 'fixed',
        setGridSize: true,
        displayGrid: DisplayGrid.OnDragAndResize,
        fixedColWidth: 100,
        fixedRowHeight: 100,
        rowHeightRatio: 1,
        minCols: 13,
        minRows: 8,
        maxCols: 13,
        maxRows: 8,
        outerMarginTop: 10,
        outerMarginRight: 10,
        outerMarginBottom: 10,
        outerMarginLeft: 10,
        allowMultiLayer: true
      }
    },
    label: 'Fixed Comfort (MacBook Pro 14)'
  },
  {
    value: {
      type: StoryPointType.Canvas,
      gridOptions: {
        gridType: 'verticalFixed',
        setGridSize: false,
        displayGrid: DisplayGrid.OnDragAndResize,
        fixedColWidth: 20,
        fixedRowHeight: 20,
        rowHeightRatio: 1,
        minCols: 13,
        maxCols: 13,
        outerMarginTop: 10,
        outerMarginRight: 10,
        outerMarginBottom: 10,
        outerMarginLeft: 10,
        allowMultiLayer: false
      }
    },
    label: 'Vertical Fixed (Phone)'
  }
]
