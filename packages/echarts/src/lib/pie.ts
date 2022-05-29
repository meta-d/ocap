import {
  ChartAnnotation,
  ChartSettings,
  EntityType,
  getChartCategory,
  getEntityProperty,
  getPropertyHierarchy,
  getPropertyMeasure,
  getPropertyName,
  getPropertyTextName,
  mergeOptions,
  QueryReturn
} from '@metad/ocap-core'
import { isNil } from 'lodash'
import { getCoordinateSystem, measuresToSeriesComponents, serializeSeriesComponent } from './cartesian'
import { coordinates, gatherCoordinates } from './coordinates'
import { getEChartsTooltip } from './tooltip'
import { EChartsOptions } from './types'

export function pie(
  data: QueryReturn<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: EChartsOptions
) {
  const pieCoordinates = coordinates(data, chartAnnotation, entityType, settings, options, 'pie', pieCoordinate)
  return gatherCoordinates(pieCoordinates, 'pie', options)
}

/**
 * 单个笛卡尔坐标系, 对应一个 grid 内的组件
 *
 * @param data 数据数组
 * @param chartAnnotation 图形注解
 * @param entityType 实体类型
 * @param settings 图形设置
 * @param options 图形属性
 * @returns
 */
export function pieCoordinate(
  data: Array<unknown>,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options: EChartsOptions
) {
  const category = getChartCategory(chartAnnotation)
  const categoryProperty = getEntityProperty(entityType, category)

  let datasets = []

  const seriesComponents = measuresToSeriesComponents(chartAnnotation.measures, data, entityType, settings)
  datasets = [
    {
      dataset: {
        source: data,
        // 非矩阵数据集应该不用定义 dimensions , 因为会直接使用字段名作为 encode
        // dimensions: [
        //   ...chartAnnotation.dimensions.map(getPropertyName),
        //   ...chartAnnotation.measures.map(getPropertyMeasure)
        // ]
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

        /**
         * 堆积系列情况下不适用 encode, 使用的应该是 seriesLayoutBy: "row" name: "[Canada]" 与 dataset 中的行数据进行的对应
         */
        if (isNil(series.seriesLayoutBy)) {
          series.encode = {
            itemId: getPropertyHierarchy(category),
            itemName: getPropertyTextName(categoryProperty),
            value: seriesComponent.measure,
            tooltip: seriesComponent.tooltip
          }
        }

        if (chartAnnotation.chartType.variant === 'Doughnut') {
          series.radius = ['40%', '80%']
          series.itemStyle = {
            borderRadius: 5
          }
        }
        if (chartAnnotation.chartType.variant === 'Nightingale') {
          series.roseType = 'area'
          series.radius = ['20%', '80%']
          series.itemStyle = {
            borderRadius: 5
          }
        }

        series.tooltip = tooltip

        mergeOptions(series, options?.seriesStyle)

        return series
      })
    })

    // gridOptions.tooltip.push(tooltip)
  })

  // TODO
  if (options?.tooltip?.trigger === 'axis') {
    gridOptions.tooltip.push({
      trigger: 'axis'
    })
  } else {
    gridOptions.tooltip.push({})
  }

  // legend
  if (options?.legend) {
    gridOptions.legend.push(options.legend)
  }

  return gridOptions
}
