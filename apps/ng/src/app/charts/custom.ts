import {
  ChartAnnotation,
  ChartDimensionRoleType,
  ChartOptions,
} from '@metad/ocap-core'

export const CustomCharts = [
  {
    title: 'Custom Chart',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Custom',
          name: '自定义仪表盘',
          scripts: `//'queryResult', 'chartAnnotation', 'entityType', 'locale', 'chartsInstance', 'utils', 'data'
          const {echarts, getEntityHierarchy} = utils
          console.log(echarts.time.format(new Date(), '{yyyy}-{MM}-{dd}', false))
          console.log(getEntityHierarchy(entityType, chartAnnotation.dimensions[0]).caption)
let progress = queryResult.data[0][chartAnnotation.measures[1].measure] / queryResult.data[0][chartAnnotation.measures[0].measure] * 100
const options = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 10,
        itemStyle: {
          shadowColor: 'rgba(0,138,255,0.45)',
          shadowBlur: 10,
          shadowOffsetX: 2,
          shadowOffsetY: 2
        },
        progress: {
          show: true,
          roundCap: true,
          width: 18
        },
        pointer: {
          icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
          length: '75%',
          width: 16,
          offsetCenter: [0, '5%']
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 18
          }
        },
        axisTick: {
          splitNumber: 2,
          lineStyle: {
            width: 2,
            color: '#999'
          }
        },
        splitLine: {
          length: 12,
          lineStyle: {
            width: 3,
            color: '#999'
          }
        },
        axisLabel: {
          distance: 30,
          color: '#999',
          fontSize: 20
        },
        title: {
          show: false
        },
        detail: {
          backgroundColor: '#fff',
          borderColor: '#999',
          borderWidth: 2,
          width: '60%',
          lineHeight: 40,
          height: 40,
          borderRadius: 8,
          offsetCenter: [0, '35%'],
          valueAnimation: true,
          formatter: function (value) {
            return '{value|' + value.toFixed(1) + '}{unit|%}';
          },
          rich: {
            value: {
              fontSize: 50,
              fontWeight: 'bolder',
              color: '#777'
            },
            unit: {
              fontSize: 20,
              color: '#999',
              padding: [0, 0, -10, 10]
            }
          }
        },
        data: [
          {
            value: progress,
            slicer: {
              dimension: chartAnnotation.dimensions[0],
              members: [
                {
                  value: '[A]',
                  caption: 'A'
                }
              ]
            }
          }
        ]
      }
    ]
  }
return {
  options,
  // onClick: (event) => {
  //   return {
  //     ...event,
  //     event: event.event?.event,
  //     slicers: [
        
  //     ]
  //   }
  // }
}
`
        },
        dimensions: [
          {
            dimension: '[Store]',
            level: '[Store].[State]'
          },
          {
            dimension: '[Time]',
            level: '[Time].[Year]',
            role: ChartDimensionRoleType.Group
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Cost',
            chartOptions: {
              axis: {
                name: '计算成本'
              }
            }
          },
          {
            dimension: 'Measures',
            measure: 'Profit',
            chartOptions: {
              visualMap: {
                right: '0',
                bottom: 200
              }
            }
          }
        ]
      } as ChartAnnotation
    },
    chartSettings: {
      
    },
    chartOptions: {
      title: {
        text: 'Sales Trends by Year within Each Month',
        subtext: 'Sample of Cycle Plot',
        left: 'center'
      },
      textStyle: {
        color: 'red',
        fontStyle: 'italic'
      }
    } as ChartOptions
  },

  {
    title: 'Custom Chart',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Custom',
          name: '自定义组合图，响应图形事件',
          scripts: `//'queryResult', 'chartAnnotation', 'entityType', 'locale', 'chartsInstance', 'utils', 'data'
          
const option = {
  legend: {},
  tooltip: {
    trigger: 'axis',
    showContent: false
  },
  dataset: {
    source: [
      ['product', '2012', '2013', '2014', '2015', '2016', '2017'],
      ['Milk Tea', 56.5, 82.1, 88.7, 70.1, 53.4, 85.1],
      ['Matcha Latte', 51.1, 51.4, 55.1, 53.3, 73.8, 68.7],
      ['Cheese Cocoa', 40.1, 62.2, 69.5, 36.4, 45.2, 32.5],
      ['Walnut Brownie', 25.2, 37.1, 41.2, 18, 33.9, 49.1]
    ]
  },
  xAxis: { type: 'category' },
  yAxis: { gridIndex: 0 },
  grid: { top: '55%' },
  series: [
    {
      type: 'line',
      smooth: true,
      seriesLayoutBy: 'row',
      emphasis: { focus: 'series' }
    },
    {
      type: 'line',
      smooth: true,
      seriesLayoutBy: 'row',
      emphasis: { focus: 'series' }
    },
    {
      type: 'line',
      smooth: true,
      seriesLayoutBy: 'row',
      emphasis: { focus: 'series' }
    },
    {
      type: 'line',
      smooth: true,
      seriesLayoutBy: 'row',
      emphasis: { focus: 'series' }
    },
    {
      type: 'pie',
      id: 'pie',
      radius: '30%',
      center: ['50%', '25%'],
      emphasis: {
        focus: 'self'
      },
      label: {
        formatter: '{b}: {@2012} ({d}%)'
      },
      encode: {
        itemName: 'product',
        value: '2012',
        tooltip: '2012'
      }
    }
  ]
};

console.log('chartsInstance on updateAxisPointer ...................................')
chartsInstance?.off('updateAxisPointer')
chartsInstance?.on('updateAxisPointer', function (event) {
  console.log(event);
  const xAxisInfo = event.axesInfo[0];
  if (xAxisInfo) {
    const dimension = xAxisInfo.value + 1;
    chartsInstance.setOption({
      series: {
        id: 'pie',
        label: {
          formatter: '{b}: {@[' + dimension + ']} ({d}%)'
        },
        encode: {
          value: dimension,
          tooltip: dimension
        }
      }
    });
  }
});

return {
  options: option,
}
`
        },
        dimensions: [
          {
            dimension: '[Store]',
            level: '[Store].[State]'
          },
          {
            dimension: '[Time]',
            level: '[Time].[Year]',
            role: ChartDimensionRoleType.Group
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Cost',
            chartOptions: {
              axis: {
                name: '计算成本'
              }
            }
          },
          {
            dimension: 'Measures',
            measure: 'Profit',
            chartOptions: {
              visualMap: {
                right: '0',
                bottom: 200
              }
            }
          }
        ]
      } as ChartAnnotation
    },
    chartSettings: {
      
    },
    chartOptions: {
      title: {
        text: 'Sales Trends by Year within Each Month',
        subtext: 'Sample of Cycle Plot',
        left: 'center'
      },
      textStyle: {
        color: 'red',
        fontStyle: 'italic'
      }
    } as ChartOptions
  },

  {
    title: 'Custom Globe with async fetch data',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Custom',
          name: '自定义组合图，响应图形事件',
          scripts: `//'queryResult', 'chartAnnotation', 'entityType', 'locale', 'chartsInstance', 'utils', 'data'
const { fromFetch, lastValueFrom } = utils
return (async () => {
const data = await lastValueFrom(fromFetch('/assets/data/population.json', {selector: (res) => res.json()}))
const options = {
  visualMap: {
    show: false,
    min: 0,
    max: 60,
    inRange: {
      symbolSize: [1.0, 10.0]
    }
  },
  globe: [{
    "environment": "/assets/starfield.jpg",
    "heightTexture": "/assets/bathymetry_bw_composite_4k.jpg",
    "displacementScale": 0.05,
    displacementQuality: 'high',
    globeOuterRadius: 100,
    baseColor: '#000',
    shading: 'realistic',
    realisticMaterial: {
      roughness: 0.2,
      metalness: 0
    },
    postEffect: {
      enable: true,
      depthOfField: {
        focalRange: 15,
        enable: true,
        focalDistance: 100
      }
    },
    temporalSuperSampling: {
      enable: true
    },
    light: {
      ambient: {
        intensity: 0
      },
      main: {
        intensity: 0.1,
        shadow: false
      },
      ambientCubemap: {
        texture: '/assets/lake.hdr',
        exposure: 1,
        diffuseIntensity: 0.5,
        specularIntensity: 2
      }
    },
    viewControl: {
      autoRotate: false,
      beta: 180,
      alpha: 20,
      distance: 100
    }
  }],
  series: {
    type: 'scatter3D',
    coordinateSystem: 'globe',
    globeIndex: 0,
    blendMode: 'lighter',
    symbolSize: 2,
    itemStyle: {
      color: 'rgb(50, 50, 150)',
      opacity: 1
    },
    data: data
    .filter(function (dataItem) {
      return dataItem[2] > 0;
    })
    .map(function (dataItem) {
      return [dataItem[0], dataItem[1], Math.sqrt(dataItem[2])];
    })
  }
}

return {
options
}
})()

`
        },
        dimensions: [
          {
            dimension: '[Store]',
            level: '[Store].[State]'
          },
          {
            dimension: '[Time]',
            level: '[Time].[Year]',
            role: ChartDimensionRoleType.Group
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Cost',
            chartOptions: {
              axis: {
                name: '计算成本'
              }
            }
          },
          {
            dimension: 'Measures',
            measure: 'Profit',
            chartOptions: {
              visualMap: {
                right: '0',
                bottom: 200
              }
            }
          }
        ]
      } as ChartAnnotation
    },
    chartSettings: {
      
    },
    chartOptions: {
      title: {
        text: 'Sales Trends by Year within Each Month',
        subtext: 'Sample of Cycle Plot',
        left: 'center'
      },
      textStyle: {
        color: 'red',
        fontStyle: 'italic'
      }
    } as ChartOptions
  },


  {
    title: 'Custom Globe with async fetch data',
    dataSettings: {
      dataSource: 'FOODMART',
      entitySet: 'Sales',
      chartAnnotation: {
        chartType: {
          type: 'Custom',
          name: '自定义组合图，响应图形事件',
          scripts: `//'queryResult', 'chartAnnotation', 'entityType', 'locale', 'chartsInstance', 'utils', 'data'
const { fromFetch, lastValueFrom } = utils
const { registerMap } = utils.echarts
return (async () => {
let data = await lastValueFrom(fromFetch('/assets/data/population.json', {selector: (res) => res.json()}))
data = data
    .filter(function (dataItem) {
      return dataItem[2] > 0;
    })
    .map(function (dataItem) {
      return [dataItem[0], dataItem[1], Math.sqrt(dataItem[2])];
    });
const usaJson = await lastValueFrom(fromFetch('/assets/USA.json', {selector: (res) => res.json()}))
  registerMap('world', usaJson, {
      Alaska: {
        left: -131,
        top: 25,
        width: 15
      },
      Hawaii: {
        left: -110,
        top: 28,
        width: 5
      },
      'Puerto Rico': {
        left: -76,
        top: 26,
        width: 2
      }
    });

const options = {
  backgroundColor: '#cdcfd5',
  geo3D: {
    map: 'world',
    shading: 'lambert',
    light: {
      main: {
        intensity: 5,
        shadow: true,
        shadowQuality: 'high',
        alpha: 30
      },
      ambient: {
        intensity: 0
      },
      ambientCubemap: {
        texture: '/assets/canyon.hdr',
        exposure: 1,
        diffuseIntensity: 0.5
      }
    },
    viewControl: {
      distance: 50,
      panMouseButton: 'left',
      rotateMouseButton: 'right'
    },
    groundPlane: {
      show: true,
      color: '#999'
    },
    postEffect: {
      enable: true,
      bloom: {
        enable: false
      },
      SSAO: {
        radius: 1,
        intensity: 1,
        enable: true
      },
      depthOfField: {
        enable: false,
        focalRange: 10,
        blurRadius: 10,
        fstop: 1
      }
    },
    temporalSuperSampling: {
      enable: true
    },
    itemStyle: {},
    regionHeight: 2
  },
  visualMap: {
    max: 40,
    calculable: true,
    realtime: false,
    inRange: {
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
    outOfRange: {
      colorAlpha: 0
    }
  },
  series: [
    {
      type: 'bar3D',
      coordinateSystem: 'geo3D',
      shading: 'lambert',
      data: data,
      barSize: 0.1,
      minHeight: 0.2,
      silent: true,
      itemStyle: {
        color: 'orange'
        // opacity: 0.8
      }
    }
  ]
}

return {
options
}
})()

`
        },
        dimensions: [
          {
            dimension: '[Store]',
            level: '[Store].[State]'
          },
          {
            dimension: '[Time]',
            level: '[Time].[Year]',
            role: ChartDimensionRoleType.Group
          }
        ],
        measures: [
          {
            dimension: 'Measures',
            measure: 'Cost',
            chartOptions: {
              axis: {
                name: '计算成本'
              }
            }
          },
          {
            dimension: 'Measures',
            measure: 'Profit',
            chartOptions: {
              visualMap: {
                right: '0',
                bottom: 200
              }
            }
          }
        ]
      } as ChartAnnotation
    },
    chartSettings: {
      
    },
    chartOptions: {
      title: {
        text: 'Sales Trends by Year within Each Month',
        subtext: 'Sample of Cycle Plot',
        left: 'center'
      },
      textStyle: {
        color: 'red',
        fontStyle: 'italic'
      }
    } as ChartOptions
  },
]
