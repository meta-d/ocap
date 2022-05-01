import {
  ChartAnnotation,
  ChartDimensionRoleType,
  ChartSettings,
  EntityType,
  getChartCategory,
  getPropertyHierarchy,
  getPropertyMeasure,
  getPropertyName,
  isChartMapType,
  QueryReturn
} from '@metad/ocap-core'
import { MapChart } from 'echarts/charts'
import { registerMap, use } from 'echarts/core'
import { measuresToSeriesComponents } from '../cartesian'
import { EChartsOptions } from '../types'
import { fromFetch } from 'rxjs/fetch'
import { firstValueFrom, shareReplay, tap } from 'rxjs'
import { tinymd5 } from '../utils'

use([MapChart])

const registerMaps = {}

let d3
export async function mapChartAnnotation(chartAnnotation: ChartAnnotation): Promise<ChartAnnotation> {
  const chartType = {...chartAnnotation.chartType}
  if (!isChartMapType(chartType)) {
    throw new Error(`It's not supposed to be here: Not a Map type`)
  }
  
  if (chartType.mapUrl) {
    const variant = tinymd5(chartType.mapUrl, 5)
    const mapType = chartType.map + '-' + variant

    if (!registerMaps[mapType]) {
      registerMaps[mapType] = fromFetch(chartType.mapUrl,
        {
          selector: (res) => res.json()
        }
      ).pipe(tap((geoJson) => registerMap(mapType, geoJson)), shareReplay(1))

      await firstValueFrom(registerMaps[mapType])
    }

    chartType.map = mapType
  }

  if (chartType.projection) {
    d3 = await import('d3-geo')
  }

  return {
    ...chartAnnotation,
    chartType
  }
}

export function mapChart(
  queryReturn: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: EChartsOptions
) {
  const chartType = {...chartAnnotation.chartType}
  if (!isChartMapType(chartType)) {
    throw new Error(`It's not supposed to be here: Not a Map type`)
  }

  const chartCategory = getChartCategory(chartAnnotation)
  const chartCategoryName = getPropertyHierarchy(chartCategory)
  const chartMeasure = chartAnnotation.measures[0]
  const chartMeasureName = getPropertyMeasure(chartMeasure)

  const seriesComponents = measuresToSeriesComponents(chartAnnotation.measures, queryReturn.results, entityType, settings)

  console.log(seriesComponents)

  let projection
  if (chartType.projection) {
    try {
      projection = d3['geo'+chartType.projection]()
    }catch(err) {
      throw new Error(`Can't found the projection '${chartType.projection}' in 'd3-geo' lib`)
    }
  }

  const series = seriesComponents.map((seriesComponent) => {

    let data
    if (seriesComponent.shapeType) {
      const latName = getPropertyName(chartAnnotation.dimensions.find((item) => item.role === ChartDimensionRoleType.Lat))
      const longName = getPropertyName(chartAnnotation.dimensions.find((item) => item.role === ChartDimensionRoleType.Long))
      data = queryReturn.results.map((item) => ({
        name: item[chartCategoryName],
        value: [item[longName], item[latName], item[chartMeasureName] ?? '-']
      }))
    } else {
      data = queryReturn.results.map((item) => ({
        name: item[chartCategoryName],
        value: item[chartMeasureName] ?? '-'
      }))
    }

    return {
      name: chartType.map + '_' + (seriesComponent.name ?? seriesComponent.measure),
      type: seriesComponent.shapeType ?? 'map',
      coordinateSystem: 'geo',
      geoIndex: 0,
      // symbolSize: 20,
      itemStyle: {
        color: '#F06C00'
      },
      emphasis: {
        label: {
          show: true
        }
      },
      data,
      encode: {
        tooltip: [2],
        value: 2
      }
    }
  })
  
  return {
    geo: {
      map: chartType.map,
      projection: projection ? {
        project: (point)=> {
          return projection(point);
        },
        unproject: (point) => {
          return projection.invert(point);
        }
      } : null,
      roam: true,
      emphasis: {
        label: {
          show: true
        }
      },
    },
    visualMap: seriesComponents.map((seriesComponent) => {
      return {
        show: false,
        left: 'right',
        min: seriesComponent.dataMin,
        max: seriesComponent.dataMax,
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
        text: ['High', 'Low'],
        calculable: true
      }
    }),
    tooltip: {
      trigger: 'item',
      showDelay: 0,
      transitionDuration: 0.2
    },
    series
  }
}
