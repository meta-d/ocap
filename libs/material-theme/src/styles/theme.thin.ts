const palette = {
  primary: '#1870dc',
  success: '#58d777',
  info: '#14d3d3',
  warning: '#f0af03',
  danger: '#f45722',
}

const theme = {
  fontMain: 'Montserrat, Open Sans, sans-serif',
  fontSecondary: 'Raleway, sans-serif',

  bg: '#222b45',
  bg2: 'rgba(0, 0, 0, 0.24)',
  bg3: '#151a30',
  bg4: '#101426',

  border: '#222b45',
  border2: '#1a2138',
  border3: '#151a30',
  border4: '#101426',
  border5: '#101426',

  fg: '#8f9bb3',
  fgHeading: '#ffffff',
  fgText: '#ffffff',
  fgHighlight: palette.primary,
  layoutBg: '#1b1b38',
  separator: '#1b1b38',

  primary: palette.primary,
  success: palette.success,
  info: palette.info,
  warning: palette.warning,
  danger: palette.danger,

  primaryLight: '#598bff',
  successLight: '#2ce69b',
  infoLight: '#42aaff',
  warningLight: '#ffc94d',
  dangerLight: '#ff708d',

  chartLabelFontColor: '#eeeeee',
  chartLabelFontSize: 14,
}

const chartTheme = {
  color: [theme.primary, theme.success, theme.info, theme.warning, theme.danger],
  textStyle: {
    fontFamily: theme.fontMain,
    color: theme.chartLabelFontColor,
    fontSize: theme.chartLabelFontSize,
  },
  title: {
    textStyle: {
      color: '#eeeeee',
    },
    subtextStyle: {
      color: '#aaaaaa',
    },
  },
  line: {
    itemStyle: {
      normal: {
        borderWidth: 1,
      },
    },
    lineStyle: {
      normal: {
        width: 6,
        type: 'dotted',
      },
    },
    symbolSize: 4,
    symbol: 'circle',
    smooth: false,
  },
  radar: {
    itemStyle: {
      normal: {
        borderWidth: 1,
      },
    },
    lineStyle: {
      normal: {
        width: 2,
      },
    },
    symbolSize: 4,
    symbol: 'circle',
    smooth: false,
  },
  bar: {
    itemStyle: {
      normal: {
        barBorderWidth: 0,
        barBorderColor: '#ccc',
      },
      emphasis: {
        barBorderWidth: 0,
        barBorderColor: '#ccc',
      },
    },
  },
  pie: {
    itemStyle: {
      normal: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
      emphasis: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
    },
  },
  scatter: {
    itemStyle: {
      normal: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
      emphasis: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
    },
  },
  boxplot: {
    itemStyle: {
      normal: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
      emphasis: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
    },
  },
  parallel: {
    itemStyle: {
      normal: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
      emphasis: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
    },
  },
  sankey: {
    itemStyle: {
      normal: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
      emphasis: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
    },
    label: {
      color: theme.chartLabelFontColor,
    },
  },
  funnel: {
    itemStyle: {
      normal: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
      emphasis: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
    },
  },
  gauge: {
    itemStyle: {
      normal: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
      emphasis: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
    },
  },
  candlestick: {
    itemStyle: {
      normal: {
        color: '#fd1050',
        color0: '#0cf49b',
        borderColor: '#fd1050',
        borderColor0: '#0cf49b',
        borderWidth: 1,
      },
    },
  },
  graph: {
    itemStyle: {
      normal: {
        borderWidth: 0,
        borderColor: '#ccc',
      },
    },
    lineStyle: {
      normal: {
        width: 1,
        color: '#aaaaaa',
      },
    },
    symbolSize: 4,
    symbol: 'circle',
    smooth: false,
    color: [
      '#dd6b66',
      '#759aa0',
      '#e69d87',
      '#8dc1a9',
      '#ea7e53',
      '#eedd78',
      '#73a373',
      '#73b9bc',
      '#7289ab',
      '#91ca8c',
      '#f49f42',
    ],
    label: {
      normal: {
        textStyle: {
          color: '#eeeeee',
        },
      },
    },
  },
  map: {
    itemStyle: {
      normal: {
        areaColor: theme.bg3,
        borderColor: '#444444',
        borderWidth: 0.5,
      },
      emphasis: {
        areaColor: 'rgba(255,215,0,0.8)',
        borderColor: '#444444',
        borderWidth: 1,
      },
    },
    label: {
      normal: {
        textStyle: {
          color: '#000000',
        },
      },
      emphasis: {
        textStyle: {
          color: 'rgb(100,0,0)',
        },
      },
    },
  },
  geo: {
    backgroundColor: theme.bg2,
    itemStyle: {
      normal: {
        areaColor: theme.bg3,
        borderColor: theme.border4,
        borderWidth: 1,
      },
      emphasis: {
        areaColor: theme.primaryLight,
        borderColor: theme.primary,
        borderWidth: 1,
      },
    },
    label: {
      normal: {
        textStyle: {
          color: theme.fgText,
        },
      },
      emphasis: {
        textStyle: {
          color: theme.fgText,
        },
      },
    },
  },
  grid: {
    top: 30,
    left: 5,
    right: 5,
    bottom: 5
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: theme.border4,
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: theme.border4,
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: theme.fg,
        fontSize: '16',
      },
    },
  },
  valueAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: theme.border4,
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: theme.border4,
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: theme.fg,
        fontSize: '16',
      },
    },
    splitLine: {
      show: true,
      lineStyle: {
        type: 'dashed',
        color: 'rgba(143, 155, 179, 0.2)',
        width: 1,
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['#292929'],
      },
    },
  },
  logAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: theme.border4,
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: theme.border4,
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: theme.fg,
        fontSize: '16',
      },
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: theme.separator,
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['#292929'],
      },
    },
  },
  timeAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: theme.border4,
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: theme.border4,
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: theme.fg,
        fontSize: '16',
      },
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: theme.separator,
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['#292929'],
      },
    },
  },
  toolbox: {
    iconStyle: {
      normal: {
        borderColor: '#999999',
      },
      emphasis: {
        borderColor: '#666666',
      },
    },
  },
  legend: {
    textStyle: {
      color: '#eeeeee',
    },
    pageIconColor: theme.fg,
    pageIconInactiveColor: theme.bg2,
    pageTextStyle: {
      color: theme.fg,
    },
  },
  tooltip: {
    backgroundColor: theme.bg2,
    extraCssText: 'box-shadow: 0px 2px 46px 0 #3366ff65; border-radius: 10px; padding: 8px 24px;',
    axisPointer: {
      shadowStyle: {
        color: 'rgba(0, 0, 0, 0.3)',
      },
      crossStyle: {
        color: 'rgba(0, 0, 0, 0.3)',
        width: '1',
      },
    },
  },
  axisPointer: {
    lineStyle: {
      // "color": "rgba(255, 255, 255, 0.3)",
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: 'rgba(0, 255, 233,0)',
          },
          {
            offset: 0.5,
            color: 'rgba(255, 255, 255,1)',
          },
          {
            offset: 1,
            color: 'rgba(0, 255, 233,0)',
          },
        ],
        global: false,
      },
      width: '1',
      type: 'dashed',
    },
  },
  timeline: {
    lineStyle: {
      color: '#eeeeee',
      width: 1,
    },
    itemStyle: {
      normal: {
        color: '#dd6b66',
        borderWidth: 1,
      },
      emphasis: {
        color: '#a9334c',
      },
    },
    controlStyle: {
      normal: {
        color: '#eeeeee',
        borderColor: '#eeeeee',
        borderWidth: 0.5,
      },
      emphasis: {
        color: '#eeeeee',
        borderColor: '#eeeeee',
        borderWidth: 0.5,
      },
    },
    checkpointStyle: {
      color: '#e43c59',
      borderColor: 'rgba(194,53,49,0.5)',
    },
    label: {
      normal: {
        textStyle: {
          color: '#eeeeee',
        },
      },
      emphasis: {
        textStyle: {
          color: '#eeeeee',
        },
      },
    },
  },
  visualMap: {
    color: ['#bf444c', '#d88273', '#f6efa6'],
  },
  dataZoom: {
    backgroundColor: 'rgba(47,69,84,0)',
    dataBackgroundColor: 'rgba(255,255,255,0.3)',
    fillerColor: 'rgba(167,183,204,0.4)',
    handleColor: '#a7b7cc',
    handleSize: '100%',
    textStyle: {
      color: '#eeeeee',
    },
  },
  markPoint: {
    label: {
      normal: {
        textStyle: {
          color: '#eeeeee',
        },
      },
      emphasis: {
        textStyle: {
          color: '#eeeeee',
        },
      },
    },
  },
}

const g2Theme = {
  backgroundStyle: {
    fill: 'unset',
  },
  defaultColor: theme.primary,
  title: {
    fill: theme.chartLabelFontColor,
    stroke: theme.chartLabelFontColor,
  },
  axis: {
    y: {
      label: {
        style: {
          fill: theme.fg,
          fontSize: theme.chartLabelFontSize,
        },
      },
      title: {
        style: {
          fill: theme.fg,
          fontSize: theme.chartLabelFontSize,
        },
      }
    },
    x: {
      label: {
        style: {
          fill: theme.fg,
          fontSize: theme.chartLabelFontSize,
        },
      },
      title: {
        style: {
          fill: theme.fg,
          fontSize: theme.chartLabelFontSize,
        },
      }
    },
  },
  legend: {
    text: {
      style: {
        fill: theme.chartLabelFontColor,
      },
    },
  },
  label: {
    offset: theme.chartLabelFontSize,
  },
  components: {
    tooltip: {
      domStyles: {
        'g2-tooltip': {
          backgroundColor: theme.bg2,
          boxShadow: `0px 2px 46px 0 ${theme.primaryLight + '65'}`,
          color: 'rgba(255, 255, 255, 0.65)',
          borderRadius: '10px',
          padding: '8px 24px'
        },
      },
    },
  },
}

export const THIN_THEME = {
  name: 'thin',
  g2Theme,
  chartTheme,
}
