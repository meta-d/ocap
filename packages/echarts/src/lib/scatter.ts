import {
  ChartAnnotation,
  ChartMeasureRoleType,
  ChartSettings,
  EntityType,
  getChartCategory,
  getChartSeries,
  getEntityProperty,
  getPropertyHierarchy,
  getPropertyTextName,
  mergeOptions,
  QueryReturn
} from '@metad/ocap-core'
import { assign, isEmpty, isNil, omitBy, uniqBy } from 'lodash'
import { getMeasureAxis } from './axis'
import { dimensionToSeriesComponent, getCoordinateSystem, serializeSeriesComponent } from './cartesian'
import { coordinates, gatherCoordinates } from './coordinates'
import { referenceLines } from './series'
import { getEChartsTooltip } from './tooltip'
import { AxisEnum, EChartsOptions } from './types'

export function scatter(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: EChartsOptions
) {
  const pieCoordinates = coordinates(data, chartAnnotation, entityType, settings, options, 'grid', scatterCoordinate)
  return gatherCoordinates(pieCoordinates, 'scatter', options)
}

/**
 * 单个散点图笛卡尔坐标系, 对应一个 grid 内的组件
 *
 * 包含对 dimension role 为 series 的处理
 *
 * @param data 数据数组
 * @param chartAnnotation 图形注解
 * @param entityType 实体类型
 * @param settings 图形设置
 * @param options 图形属性
 * @returns
 */
export function scatterCoordinate(
  data: Array<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: EChartsOptions
) {
  const category = getChartCategory(chartAnnotation)
  const categoryProperty = getEntityProperty(entityType, category)
  // const category2 = getChartCategory2(chartAnnotation)
  const chartSeries = getChartSeries(chartAnnotation)

  let datasets = []
  if (chartSeries) {
    const chartSeriesName = getPropertyHierarchy(chartSeries)
    const chartSeriesTextName = getPropertyTextName(getEntityProperty(entityType, chartSeries))
    const categoryValues = uniqBy(data, chartSeriesName).map((x) => ({
      value: x[chartSeriesName],
      label: x[chartSeriesTextName]
    }))

    const dataset: any = [
      {
        source: data
      }
    ]
    const seriesComponents = []
    categoryValues.forEach(({ value, label }, index) => {
      dataset.push({
        transform: [
          {
            type: 'filter',
            config: { dimension: chartSeriesName, value: value }
          }
        ]
      })
      const seriesComponent = dimensionToSeriesComponent(
        label || value,
        chartSeries,
        chartAnnotation.measures,
        data,
        entityType,
        settings
      )
      seriesComponent.datasetIndex = index + 1
      seriesComponents.push(seriesComponent)
    })

    datasets.push({
      dataset,
      seriesComponents
    })
  } else {
    const seriesComponent = dimensionToSeriesComponent(
      null,
      category,
      chartAnnotation.measures,
      data,
      entityType,
      settings
    )
    datasets = [
      {
        dataset: {
          source: data
        },
        seriesComponents: [seriesComponent],
        tooltip: getEChartsTooltip(
          options?.tooltip,
          categoryProperty,
          chartAnnotation.measures.map((measure) => ({
            measure,
            property: getEntityProperty(entityType, measure)
          })),
          [seriesComponent],
          settings.locale
        )
      }
    ]
  }

  const { categoryAxis, valueAxis } = getCoordinateSystem(chartAnnotation, entityType, data, options, settings.locale)

  const gridOptions = {
    grid: mergeOptions(
      {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        containLabel: true
      },
      options?.grid
    ),
    [categoryAxis.orient]: categoryAxis.axis,
    [valueAxis.orient]: valueAxis.axis,
    visualMap: [],
    datasets: [],
    tooltip: [],
    legend: [],
    series: []
  }

  const axis1 = getMeasureAxis(chartAnnotation, ChartMeasureRoleType.Axis1, 0)
  const axis2 = getMeasureAxis(chartAnnotation, ChartMeasureRoleType.Axis2, 1)

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
          settings,
          options
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
            [AxisEnum[categoryAxis.orient]]: axis1?.measure,
            [AxisEnum[valueAxis.orient]]: axis2?.measure,
            itemName: categoryProperty.name,
            tooltip: [axis1?.measure, axis2?.measure, ...seriesComponent.tooltip]
          }
        }

        /**
         * 依赖于 Measure 1 和 Measure 2 的 referenceLines
         */
        if (!isEmpty(axis1?.referenceLines) || !isEmpty(axis2?.referenceLines)) {
          series.markLine = mergeOptions({data: []}, options.seriesStyle.markLine)
          assign(series, referenceLines(axis1, axis2, options, valueAxis.orient))
        }

        series.tooltip = tooltip

        mergeOptions(series, options?.seriesStyle)

        return series
      })
    })

    // gridOptions.tooltip.push(tooltip)
  })

  // TODO
  if (options?.tooltip) {
    if (options?.tooltip?.trigger === 'axis') {
      gridOptions.tooltip.push({
        trigger: 'axis'
      })
    } else {
      gridOptions.tooltip.push(omitBy(options.tooltip, isNil))
    }
  }

  // legend
  if (options?.legend) {
    gridOptions.legend.push(options.legend)
  }

  return gridOptions
}
