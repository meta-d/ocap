import {
  ChartAnnotation,
  ChartDimension,
  ChartMeasure,
  ChartMeasureRoleType,
  ChartOrient,
  EntityType,
  getEntityProperty,
  mergeOptions,
  Property
} from '@metad/ocap-core'
import { format, formatMeasureNumber, setCategoryAxisLabel, _formatDimensionValue } from './common'
import { AxisEnum, EChartsOptions } from './types'

/**
 * 设置轴方向布局
 *
 * @param orient ChartOrient
 * @return [categoryAxis, valueAxis]
 */
export function axisOrient(orient: ChartOrient): [AxisEnum, AxisEnum] {
  // Chart Orient
  if (orient === ChartOrient.horizontal) {
    return [AxisEnum.y, AxisEnum.x]
  } else {
    return [AxisEnum.x, AxisEnum.y]
  }
}

/**
 * 计算 Category Axis 设置
 *
 * @param categoryType Axis Type [ECharts xAxis.type](https://echarts.apache.org/en/option.html#xAxis.type)
 * @param items
 * @param dimension
 * @param categoryProperty
 * @param chartOptions
 * @returns
 */
export function getCategoryAxis(
  items: Array<unknown>,
  dimension: ChartDimension,
  categoryProperty: Property,
  chartOptions,
  categoryType = 'category'
) {
  let categoryAxis: any = {
    type: categoryType
    // name: dimension.dimension
  }

  setCategoryAxisLabel(categoryAxis, items, dimension, categoryProperty)
  setCategoryAxisPointerLabel(categoryAxis, items, categoryProperty)

  categoryAxis = mergeOptions(categoryAxis, chartOptions?.categoryAxis)

  if (chartOptions?.categoryAxis?.showName) {
    categoryAxis.name = categoryProperty.label
  }

  return categoryAxis
}

/**
 * 从度量中计算出值轴配置
 *
 * @param chartAnnotation
 * @param entityType
 * @param chartOptions
 * @param locale
 * @returns
 */
export function getValueAxis(
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  chartOptions: EChartsOptions,
  locale?: string
): any {
  const axis1 = getMeasureAxis(chartAnnotation, ChartMeasureRoleType.Axis1, 0)
  const axis2 = getMeasureAxis(chartAnnotation, ChartMeasureRoleType.Axis2, 1)

  if (!axis1) {
    throw new Error(`需要配置的度量轴`)
  }

  const axis1Property = getEntityProperty(entityType, axis1)

  const valueAxis: any = mergeOptions(
    {
      type: 'value',
      axisLabel: {
        formatter: (value, index: number) =>
          formatMeasureNumber({ measure: axis1, property: axis1Property }, value, locale)
      }
    },
    chartOptions?.valueAxis
  )

  if (chartOptions?.valueAxis?.showName) {
    valueAxis.name = axis1Property.label
  }

  if (axis2) {
    const axis2Property = getEntityProperty(entityType, axis2)
    const valueAxis2: any = mergeOptions(
      {
        type: 'value',
        axisLabel: {
          formatter: (value, index: number) =>
            formatMeasureNumber({ measure: axis2, property: axis2Property }, value, locale)
        }
      },
      chartOptions?.valueAxis
    )

    if (chartOptions?.valueAxis?.showName) {
      valueAxis2.name = axis2Property.label
    }

    return [valueAxis, valueAxis2]
  }
  return [valueAxis]
}

export function getMeasureAxis(
  chartAnnotation: ChartAnnotation,
  role: ChartMeasureRoleType,
  index: number
): ChartMeasure {
  return (
    chartAnnotation.measures.find((item) => item.role === role) ||
    chartAnnotation.measures.filter((item) => !item.role)?.[index]
  )
}

/**
 *
 * @param category
 * @param items
 * @param property 暂时只支持一个 dimension
 */
export function setCategoryAxisPointerLabel(category, items, property: Property) {
  category.axisPointer = category.axisPointer || {}
  category.axisPointer.label = category.axisPointer.label || {}
  category.axisPointer.label.formatter = (params) => {
    // TODO
    if (params.seriesData[0]) {
      const index = params.seriesData[0].dataIndex
      return _formatDimensionValue(items[index], property)
      // if (property.text) {
      //     return items[index][(property.text && property.text.name)] + '(' + items[index][property.name] + ')'
      // } else {
      //     return items[index][property.name]
      // }
    } else {
      return params.value
    }
  }
  if (category.type === 'time') {
    category.axisPointer.label.formatter = (params) => {
      return format(params.value, 'yyyy-MM-dd')
    }
  }
}

