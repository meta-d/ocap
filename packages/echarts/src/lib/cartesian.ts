import {
  ChartAnnotation,
  ChartDimension,
  ChartMeasure,
  ChartMeasureRoleType,
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
  Property,
  QueryReturn,
  ReferenceLineType,
  ReferenceLineValueType
} from '@metad/ocap-core'
import { LinearGradient } from 'echarts/lib/util/graphic'
import { chunk, groupBy, includes, indexOf, isArray, isEmpty, isNil, maxBy, minBy, range } from 'lodash'
import { axisOrient, getCategoryAxis, getValueAxis } from './axis'
import { getChromaticScale } from './chromatics'
import { dataZoom } from './data-zoom'
import { DecalPatterns } from './decal'
import { stackedForMeasure } from './stacked'
import { getEChartsTooltip } from './tooltip'
import { AxisEnum, EChartsOptions, SeriesComponentType } from './types'

export function cartesian(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: EChartsOptions,
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
    tooltip: [{
      trigger: 'axis'
    }],
    dataZoom: dataZoom(options)
  }

  cartesianCoordinates.forEach((cartesianCoordinate, gridIndex) => {
    echartsOptions.grid.push(cartesianCoordinate.grid)
    echartsOptions.xAxis.push(...cartesianCoordinate.xAxis.map((xAxis) => ({
      ...xAxis,
      gridIndex
    })))
    echartsOptions.yAxis.push(...cartesianCoordinate.yAxis.map((yAxis) => ({
      ...yAxis,
      gridIndex
    })))

    cartesianCoordinate.datasets.forEach(({ dataset, series }) => {
      echartsOptions.dataset.push({
        ...dataset
      })
      series.forEach((series) => {
        echartsOptions.series.push({
          ...series,
          xAxisIndex: echartsOptions.xAxis.length + (series.xAxisIndex ?? 0) - 1,
          yAxisIndex: echartsOptions.xAxis.length + (series.yAxisIndex ?? 0) - 1,
          datasetIndex: echartsOptions.dataset.length - 1,
          type: series.type ?? type
        })
      })
    })

    echartsOptions.visualMap.push(...cartesianCoordinate.visualMap)
    // echartsOptions.tooltip.push(...cartesianCoordinate.tooltip)
  })

  return echartsOptions
}

// 多个笛卡尔坐标系
export function cartesians(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: EChartsOptions
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
  options: EChartsOptions
) {
  const category = getChartCategory(chartAnnotation)
  const categoryProperty = getEntityProperty(entityType, category)
  const category2 = getChartCategory2(chartAnnotation)
  const chartSeries = getChartSeries(chartAnnotation)

  let datasets = []
  if (chartSeries) {
    datasets = chartAnnotation.measures
      .filter(
        ({ role }) =>
          !includes([ChartMeasureRoleType.Tooltip, ChartMeasureRoleType.Size, ChartMeasureRoleType.Lightness], role)
      )
      .map((measure) => {
        return stackedForMeasure(data, measure, chartAnnotation, entityType, settings, options)
      })
  } else {
    const seriesComponents = measuresToSeriesComponents(chartAnnotation.measures, data, entityType, settings)
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
          settings.locale
        )
      }
    ]
  }

  const { categoryAxis, valueAxis } = getCoordinateSystem(chartAnnotation, entityType, data, options, settings.locale)

  const gridOptions = {
    grid: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      containLabel: true
    },
    [categoryAxis.orient]: categoryAxis.axis,
    [valueAxis.orient]: valueAxis.axis,
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
          series[valueAxis.orient + 'Index'] = seriesComponent.valueAxisIndex
        }
        /**
         * 堆积系列情况下不适用 encode, 使用的应该是 seriesLayoutBy: "row" name: "[Canada]" 与 dataset 中的行数据进行的对应
         */
        if (isNil(series.seriesLayoutBy)) {
          series.encode = {
            [AxisEnum[categoryAxis.orient]]: getPropertyHierarchy(category),
            [AxisEnum[valueAxis.orient]]: category2 ? getPropertyHierarchy(category2) : seriesComponent.measure,
            tooltip: seriesComponent.tooltip
          }
        }

        series.tooltip = tooltip

        return series
      })
    })

    // gridOptions.tooltip.push(tooltip)
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

  if (seriesComponent.sizeMeasure) {
    visualMaps.push(
      getSymbolSizeVisualMap(
        seriesComponent.sizeMeasure,
        getEntityProperty(entityType, seriesComponent.sizeMeasure),
        dataset
      )
    )
  }
  if (seriesComponent.lightnessMeasure) {
    const lightnessProperty = getEntityProperty(entityType, seriesComponent.lightnessMeasure)
    visualMaps.push(getColorLightnessVisualMap(seriesComponent.lightnessMeasure, lightnessProperty, dataset))
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

export function getSymbolSizeVisualMap(measure: ChartMeasure, property: Property, dataset: any) {
  const dataMin = minBy(dataset.source, measure.measure)?.[measure.measure]
  const dataMax = maxBy(dataset.source, measure.measure)?.[measure.measure]

  return {
    left: 'right',
    top: '10%',
    dimension: dataset.dimensions.indexOf(measure.measure),
    min: dataMin,
    max: dataMax,
    itemWidth: 30,
    itemHeight: 120,
    calculable: true,
    precision: 0.1,
    text: [property.label || property.name],
    textGap: 30,
    inRange: {
      symbolSize: [10, 70]
    },
    outOfRange: {
      symbolSize: [10, 70],
      color: ['rgba(255,255,255,0.4)']
    },
    controller: {
      inRange: {
        color: ['#c23531']
      },
      outOfRange: {
        color: ['#999']
      }
    }
  }
}

export function getColorLightnessVisualMap(
  measure: ChartMeasure,
  property: Property,
  dataset: { dimensions: string[]; source: any }
) {
  const dataMin = minBy(dataset.source, measure.measure)?.[measure.measure]
  const dataMax = maxBy(dataset.source, measure.measure)?.[measure.measure]

  return {
    left: 'right',
    bottom: '5%',
    dimension: dataset.dimensions.indexOf(measure.measure),
    min: dataMin,
    max: dataMax,
    itemHeight: 120,
    text: [property.label || property.name],
    textGap: 30,
    inRange: {
      colorLightness: [0.9, 0.5]
    },
    outOfRange: {
      color: ['rgba(255,255,255,0.4)']
    },
    controller: {
      inRange: {
        color: ['#c23531']
      },
      outOfRange: {
        color: ['#999']
      }
    }
  }
}

export function measuresToSeriesComponents(
  measures: ChartMeasure[],
  data: any[],
  entityType: EntityType,
  settings: ChartSettings
) {
  const tooltips = measures.filter(({ role }) => role === ChartMeasureRoleType.Tooltip)
  const _measures = measures.filter(
    ({ role }) =>
      !includes([ChartMeasureRoleType.Tooltip, ChartMeasureRoleType.Size, ChartMeasureRoleType.Lightness], role)
  )

  return _measures.map((measure) => {
    const measureName = getPropertyMeasure(measure)
    const measureProperty = getEntityProperty(entityType, measure)
    const valueAxisIndex = measure.role === ChartMeasureRoleType.Axis2 ? 1 : 0
    const dataNotNull = data.filter((item) => !isNil(item[measureName]))
    const minItem = minBy(dataNotNull, measureName)
    const maxItem = maxBy(dataNotNull, measureName)
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
      tooltip: tooltips.map(({ measure }) => measure),
      sizeMeasure: measures.find(({ role }) => role === ChartMeasureRoleType.Size),
      lightnessMeasure: measures.find(({ role }) => role === ChartMeasureRoleType.Lightness)
    } as SeriesComponentType
  })
}

export function getCoordinateSystem(
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  items: Array<unknown>,
  chartOptions: EChartsOptions,
  locale?: string
) {
  const [categoryOrient, valueOrient] = axisOrient(chartAnnotation.chartType.orient)

  const category = getChartCategory(chartAnnotation)
  const category2 = getChartCategory2(chartAnnotation)

  let valueAxis = null
  // 设置维度轴值
  const categoryAxis = getCategoryAxis(items, category, getEntityProperty(entityType, category), chartOptions)
  categoryAxis.orient = categoryOrient

  if (category2) {
    valueAxis = [getCategoryAxis(items, category2, getEntityProperty(entityType, category2), chartOptions)]
  } else {
    valueAxis = getValueAxis(chartAnnotation, entityType, chartOptions, locale)
  }
  valueAxis.orient = valueOrient

  return { categoryAxis: {orient: categoryOrient, axis: [categoryAxis]}, valueAxis: {orient: valueOrient, axis: valueAxis} }
}
