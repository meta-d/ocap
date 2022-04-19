import {
  ChartAnnotation,
  ChartDimensionRoleType,
  ChartMeasure,
  EntityType,
  getChartCategory,
  getChartCategory2,
  getEntityProperty,
  getPropertyHierarchy,
  getPropertyMeasure
} from '@metad/ocap-core'
import { uniqBy } from 'lodash'
import { ChartSettings, SeriesComponentType } from './types'

export function stackedForMeasure(
  results: Array<unknown>,
  measure: ChartMeasure,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings
) {
  const category = getChartCategory(chartAnnotation)
  const category2 = getChartCategory2(chartAnnotation)

  const measureProperty = getEntityProperty(entityType, measure)

  const { categoryValues, category2Values, source } = getMatrixForMeasure(
    results,
    getPropertyHierarchy(category),
    getPropertyHierarchy(category2),
    getPropertyMeasure(measure)
  )
  return {
    dataset: {
      id: getDatasetIdForMeasure(getPropertyMeasure(measure)),
      source
    },
    seriesComponents: category2Values.map((category2Value) => {
      return {
        name: category2Value,
        property: measureProperty,
        measure: getPropertyMeasure(measure),
        formatting: measure.formatting,
        seriesStack: category2.role === ChartDimensionRoleType.Stacked ? getPropertyMeasure(measure) : null,
        seriesLayoutBy: 'row'
        // tooltip: tooltips.map(({ measure }) => measure)
      } as SeriesComponentType
    })
  }
}

export function getMatrixForMeasure(items: Array<unknown>, category: string, category2: string, measure: string) {
  // Itmes key-value 化, 解决使用 lodash find 函数速度问题
  const itemsMap = new Map()
  items.forEach((item) => {
    itemsMap.set(`${item[category]}/${item[category2]}`, item)
  })

  const categoryValues = uniqBy(items, category).map((x) => x[category])
  const category2Values = uniqBy(items, category2).map((x) => x[category2])

  const dataset = category2Values.map((category2Value, i) => {
    const values = categoryValues.map((categoryValue) => {
      const item = itemsMap.get(`${categoryValue}/${category2Value}`)
      if (item) {
        return item[measure]
      }
      return '-'
    })
    return values
  })

  // 最后拼出数据集
  return {
    categoryValues,
    category2Values,
    source: [
      [category2, ...categoryValues],
      ...category2Values.map((value, i) => [`${value}`, ...dataset[i]])
      // ...(this.settings?.summaries?.map((summary) => [summary.type, ...this.summary(dataset, summary)]) || []),
      // 最后附上一行以 categoryValue 为 key 对应的 item 对象便于用户事件中使用
      // [
      //   '__item__',
      //   ...categoryValues.map((categoryValue) => {
      //     return categoryItems.get(categoryValue)
      //   })
      // ]
    ]
  }
}

export function getDatasetIdForMeasure(name: string) {
  return `--${name}`
}
