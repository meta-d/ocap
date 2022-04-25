import {
  ChartAnnotation,
  ChartMeasureRoleType,
  ChartOptions,
  ChartSettings,
  EntityType,
  getChartCategory,
  getChartSeries,
  getEntityProperty,
  getPropertyHierarchy,
  getPropertyMeasure,
  getPropertyName,
  QueryReturn
} from '@metad/ocap-core'
import { isNil, maxBy, minBy, omitBy } from 'lodash'
import { serializeSeriesComponent } from './cartesian'
import { SeriesComponentType } from './types'

export function cartesian3d(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: ChartOptions,
  type: string
) {
  const cartesianCoordinate = cartesianCoordinate3d(data.results, chartAnnotation, entityType, settings, options)

  const echartsOptions = {
    dataset: [],
    grid3D: [],
    xAxis3D: [],
    yAxis3D: [],
    zAxis3D: [],
    series: [],
    // visualMap: []
  }

  ;[cartesianCoordinate].forEach((cartesianCoordinate) => {
    echartsOptions.grid3D.push(cartesianCoordinate.grid3D)
    echartsOptions.xAxis3D.push(cartesianCoordinate.xAxis3D)
    echartsOptions.yAxis3D.push(cartesianCoordinate.yAxis3D)
    echartsOptions.zAxis3D.push(cartesianCoordinate.zAxis3D)

    cartesianCoordinate.datasets.forEach(({ dataset, series }) => {
      echartsOptions.dataset.push(dataset)
      series.forEach((series) => {
        echartsOptions.series.push({
          ...series,
          datasetIndex: echartsOptions.dataset.length - 1,
          type: series.type ?? type
        })
      })
    })
  })

  return echartsOptions
}

// 单个笛卡尔坐标系
export function cartesianCoordinate3d(
  data: Array<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: ChartOptions
) {
  const category = getChartCategory(chartAnnotation)
  const category2 = getChartSeries(chartAnnotation)
  const tooltips = chartAnnotation.measures.filter(({ role }) => role === ChartMeasureRoleType.Tooltip)

  const datasets = [
    {
      dataset: {
        source: data,
        dimensions: [
          ...chartAnnotation.dimensions.map(getPropertyName),
          ...chartAnnotation.measures.map(getPropertyMeasure)
        ]
      },
      seriesComponents: chartAnnotation.measures
        .filter(({ role }) => role !== ChartMeasureRoleType.Tooltip)
        .map((measure) => {
          const measureName = getPropertyMeasure(measure)
          const measureProperty = getEntityProperty(entityType, measure)
          const valueAxisIndex = measure.role === ChartMeasureRoleType.Axis2 ? 1 : 0
          const minItem = minBy(data, measureName)
          const maxItem = maxBy(data, measureName)
          return {
            ...measure,
            name: measureProperty?.label,
            label: measureProperty?.label,
            seriesType: measure.shapeType,
            property: measureProperty,
            dataMin: minItem?.[measureName],
            dataMax: maxItem?.[measureName],
            dataSize: data.length,
            valueAxisIndex,
            tooltip: tooltips.map(({ measure }) => measure)
          } as SeriesComponentType
        })
    }
  ]

  const grid3dOptions = {
    grid3D: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      containLabel: true
    },
    xAxis3D: {
      type: 'category'
    },
    yAxis3D: {
      type: 'category'
    },
    zAxis3D: {
      type: 'value'
    },
    visualMap: [],
    datasets: []
  }

  datasets.forEach(({ dataset, seriesComponents }) => {
    grid3dOptions.datasets.push({
      dataset,
      series: seriesComponents.map((seriesComponent) => {
        const { series, visualMaps } = serializeSeriesComponent(dataset, seriesComponent, entityType, category, 'z', settings)
        grid3dOptions.visualMap.push(...visualMaps)

        series.encode = {
          x: getPropertyHierarchy(category),
          y: getPropertyHierarchy(category2),
          z: seriesComponent.measure
        }

        return omitBy(series, isNil)
      })
    })
  })

  return grid3dOptions
}
