import {
  ChartAnnotation,
  ChartDimension,
  ChartMeasureRoleType,
  ChartOptions,
  ChartSettings,
  EntityType,
  getChartCategory,
  getChartCategory2,
  getChartSeries,
  getChartTrellis,
  getEntityProperty,
  getPropertyHierarchy,
  getPropertyMeasure,
  getPropertyName,
  getPropertyTextName,
  QueryReturn,
  ReferenceLineType,
  ReferenceLineValueType
} from '@metad/ocap-core'
import { LinearGradient } from 'echarts/lib/util/graphic'
import { chunk, groupBy, indexOf, isArray, isEmpty, isNil, maxBy, minBy, range } from 'lodash'
import { axisOrient } from './axis'
import { getChromaticScale } from './chromatics'
import { DecalPatterns } from './decal'
import { stackedForMeasure } from './stacked'
import { getEChartsTooltip } from './tooltip'
import { AxisEnum, SeriesComponentType } from './types'


export function cartesian(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: ChartOptions,
  type: string
) {
  const cartesianCoordinates = cartesians(data, chartAnnotation, entityType, settings, options)

  const echartsOptions = {
    dataset: [],
    grid: [],
    xAxis: [],
    yAxis: [],
    series: [],
    visualMap: [],
    tooltip: []
  }

  cartesianCoordinates.forEach((cartesianCoordinate, gridIndex) => {
    echartsOptions.grid.push(cartesianCoordinate.grid)
    echartsOptions.xAxis.push({
      ...cartesianCoordinate.xAxis,
      gridIndex
    })
    echartsOptions.yAxis.push({
      ...cartesianCoordinate.yAxis,
      gridIndex
    })

    cartesianCoordinate.datasets.forEach(({ dataset, series }) => {
      echartsOptions.dataset.push({
        ...dataset
      })
      series.forEach((series) => {
        echartsOptions.series.push({
          ...series,
          xAxisIndex: gridIndex,
          yAxisIndex: gridIndex,
          datasetIndex: echartsOptions.dataset.length - 1,
          type: series.type ?? type
        })
      })
    })

    echartsOptions.visualMap.push(...cartesianCoordinate.visualMap)
    echartsOptions.tooltip.push(...cartesianCoordinate.tooltip)
  })

  return echartsOptions
}

// 多个笛卡尔坐标系
export function cartesians(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: ChartOptions
) {
  const trellis = getChartTrellis(chartAnnotation)
  if (trellis) {
    const trellisName = getPropertyHierarchy(trellis)
    const trellisResults = groupBy(data.results, trellisName)

    const coordinates = Object.keys(trellisResults).map((trellisKey) => {
      const dimensions = [...chartAnnotation.dimensions]
      const index = dimensions.indexOf(trellis)
      dimensions.splice(index, 1)

      const coordinate = cartesianCoordinate(
        trellisResults[trellisKey],
        {
          ...chartAnnotation,
          dimensions
        },
        entityType,
        settings,
        options
      )

      coordinate.datasets = coordinate.datasets.map((dataset) => ({
        ...dataset,
        series: dataset.series.map((series) => ({
          ...series,
          id: `${trellisKey}-${series.id}`
        }))
      }))
      return coordinate
    })

    const trellisHorizontal = settings?.trellisHorizontal ?? 2
    const trellisVertical = Math.ceil(coordinates.length / trellisHorizontal)

    const coordinatesGroups = chunk(coordinates, trellisHorizontal)

    const coordinateResults = []
    coordinatesGroups.forEach((group, v) => {
      group.forEach((coordinate, h) => {
        coordinateResults.push({
          ...coordinate,
          grid: {
            ...coordinate.grid,
            left: h * (100 / trellisHorizontal) + '%',
            top: v * (100 / trellisVertical) + '%',
            width: 100 / trellisHorizontal + '%',
            height: 100 / trellisVertical + '%'
          }
        })
      })
    })

    return coordinateResults
  }

  return [cartesianCoordinate(data.results, chartAnnotation, entityType, settings, options)]
}

// 单个笛卡尔坐标系
export function cartesianCoordinate(
  data: Array<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: ChartOptions
) {
  const category = getChartCategory(chartAnnotation)
  const categoryProperty = getEntityProperty(entityType, category)
  const category2 = getChartCategory2(chartAnnotation)
  const chartSeries = getChartSeries(chartAnnotation)

  const tooltips = chartAnnotation.measures.filter(({ role }) => role === ChartMeasureRoleType.Tooltip)
  let datasets = []
  if (chartSeries) {
    datasets = chartAnnotation.measures
      .filter(({ role }) => role !== ChartMeasureRoleType.Tooltip)
      .map((measure) => {
        return stackedForMeasure(data, measure, chartAnnotation, entityType, settings)
      })
  } else {

    const seriesComponents = chartAnnotation.measures
      .filter(({ role }) => role !== ChartMeasureRoleType.Tooltip)
      .map((measure) => {
        const measureName = getPropertyMeasure(measure)
        const measureProperty = getEntityProperty(entityType, measure)
        const valueAxisIndex = measure.role === ChartMeasureRoleType.Axis2 ? 1 : 0
        const minItem = minBy(data, measureName)
        const maxItem = maxBy(data, measureName)
        return {
          ...measure,
          id: settings?.universalTransition ? getPropertyMeasure(measure) : null,
          name: measureProperty?.label,
          label: measureProperty?.label,
          seriesType: measure.shapeType,
          property: measureProperty,
          dataMin: minItem?.[measureName],
          dataMax: maxItem?.[measureName],
          dataSize: data.length,
          valueAxisIndex,
          //  seriesStack: `${valueAxisIndex}`,
          // measure: measure,
          tooltip: tooltips.map(({ measure }) => measure)
        } as SeriesComponentType
      })
    datasets = [
      {
        dataset: {
          source: data,
          dimensions: [
            ...chartAnnotation.dimensions.map(getPropertyName),
            ...chartAnnotation.measures.map(getPropertyMeasure)
          ]
        },
        seriesComponents,
        tooltip: getEChartsTooltip(
            options?.tooltip,
            categoryProperty,
            chartAnnotation.measures.map((measure) => ({
              measure,
              property: getEntityProperty(entityType, measure)
            })),
            seriesComponents,
            'zh-Hans'
          )
      }
    ]
  }

  const [categoryAxis, valueAxis] = axisOrient(chartAnnotation.chartType.orient)

  const gridOptions = {
    grid: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      containLabel: true
    },
    [categoryAxis]: {
      type: 'category'
    },
    [valueAxis]: {
      type: category2 ? 'category' : 'value'
    },
    visualMap: [],
    datasets: [],
    tooltip: [],
    series: []
  }

  datasets.forEach(({ dataset, seriesComponents, tooltip }) => {
    gridOptions.datasets.push({
      dataset,
      series: seriesComponents.map((seriesComponent) => {
        const { series, visualMaps } = serializeSeriesComponent(
          dataset,
          seriesComponent,
          entityType,
          category,
          valueAxis,
          settings
        )
        gridOptions.visualMap.push(...visualMaps)

        if (!isNil(seriesComponent.valueAxisIndex)) {
          series[valueAxis + 'Index'] = seriesComponent.valueAxisIndex
        }
        /**
         * 堆积系列情况下不适用 encode, 使用的应该是 seriesLayoutBy: "row" name: "[Canada]" 与 dataset 中的行数据进行的对应
         */
        if (isNil(series.seriesLayoutBy)) {
          series.encode = {
            [AxisEnum[categoryAxis]]: getPropertyHierarchy(category),
            [AxisEnum[valueAxis]]: category2 ? getPropertyHierarchy(category2) : seriesComponent.measure,
            tooltip: seriesComponent.tooltip
          }
        }

        return series
      })
    })

    gridOptions.tooltip.push(tooltip)
  })

  return gridOptions
}

export function serializeSeriesComponent(
  dataset,
  seriesComponent: SeriesComponentType,
  entityType,
  category,
  valueAxis,
  settings: ChartSettings
) {
  const visualMaps = []
  const categoryProperty = getEntityProperty(entityType, category)
  const categoryText = getPropertyTextName(categoryProperty)

  const series: any = {
    id: seriesComponent.id,
    name: seriesComponent.name ?? seriesComponent.id,
    type: seriesComponent.seriesType,
    // itemId: category,
    // itemName: categoryText ?? category,
    measure: seriesComponent.measure,
    datasetIndex: seriesComponent.datasetIndex,
    seriesLayoutBy: seriesComponent.seriesLayoutBy,
    stack: seriesComponent.seriesStack,
    universalTransition: settings?.universalTransition
  }

  if (seriesComponent.palette?.name) {
    const visualMap: any = {
      show: false,
      type: 'continuous',
      // seriesIndex: i,
      inRange: {}
    }
    const domain = seriesComponent.domain || [seriesComponent.dataMin, seriesComponent.dataMax]
    const colorFun: any = getChromaticScale(
      seriesComponent.palette.name,
      [0, seriesComponent.dataSize - 1],
      seriesComponent.palette.reverse
    )
    visualMap.inRange.color = range(seriesComponent.dataSize).map((i) => colorFun(i))

    visualMap.min = domain[0]
    visualMap.max = domain[1]
    visualMap.dimension = getVisualMapValueAxisIndex(dataset, seriesComponent, null)
    series.color = getLegendColorForVisualMap(visualMap.inRange.color)

    visualMaps.push(visualMap)
  }

  if (!isNil(seriesComponent.palette?.pattern)) {
    series.itemStyle = series.itemStyle ?? {}
    series.itemStyle.decal = DecalPatterns()[seriesComponent.palette.pattern]
  }

  if (!isEmpty(seriesComponent.referenceLines)) {
    seriesComponent.referenceLines.forEach((referenceLine) => {
      if (referenceLine.type) {
        const referenceLineData = {
          name: referenceLine.label
        }

        if (referenceLine.valueType === ReferenceLineValueType.fixed) {
          referenceLineData[valueAxis] = referenceLine.value
        } else if (referenceLine.valueType === ReferenceLineValueType.dynamic) {
          referenceLineData['type'] = referenceLine.aggregation
        }

        if (referenceLine.type === ReferenceLineType.markLine) {
          series.markLine = series.markLine ?? {
            label: {
              show: true,
              position: 'insideStartTop',
              formatter: '{b}:{c}'
            },
            data: []
          }

          series.markLine.data.push(referenceLineData)
        } else if (referenceLine.type === ReferenceLineType.markPoint) {
          series.markPoint = series.markPoint ?? {
            label: {
              show: true,
              position: 'insideStartTop',
              formatter: '{b}:{c}'
            },
            data: []
          }
          series.markPoint.data.push(referenceLineData)
        }
      }
    })
  }

  return {
    series,
    visualMaps
  }
}

export function getVisualMapValueAxisIndex(dataset, seriesComponent, series?: ChartDimension) {
  if (series) {
    dataset = dataset.find((item) => item.id === `--${seriesComponent.measure}`)
  } else if (isArray(dataset)) {
    dataset = dataset[0]
  }
  return indexOf(dataset.dimensions, seriesComponent.measure)
}

export function getLegendColorForVisualMap(colors) {
  if (colors && colors.length > 2) {
    return new LinearGradient(0, 0, 1, 0, [
      {
        offset: 0,
        color: colors[0]
      },
      {
        offset: 0.5,
        color: colors[Math.floor(colors.length / 2)]
      },
      {
        offset: 1,
        color: colors[colors.length - 1]
      }
    ])
  } else if (colors && colors.length > 1) {
    return new LinearGradient(0, 0, 1, 0, [
      {
        offset: 0,
        color: colors[0]
      },
      {
        offset: 1,
        color: colors[colors.length - 1]
      }
    ])
  } else if (colors && colors.length > 0) {
    return colors[0]
  }
  return undefined
}
