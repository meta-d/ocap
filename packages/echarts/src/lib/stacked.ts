import {
  ChartAnnotation,
  ChartDimension,
  ChartDimensionRoleType,
  ChartMeasure,
  ChartSettings,
  ChartOptions,
  EntityType,
  getChartCategory,
  getChartSeries,
  getEntityProperty,
  getPropertyHierarchy,
  getPropertyMeasure,
  getPropertyTextName
} from '@metad/ocap-core'
import { uniqBy } from 'lodash'
import { axisOrient } from './axis'
import { getEChartsMatrixTooltip } from './tooltip'
import { SeriesComponentType } from './types'

export function stackedForMeasure(
  results: Array<unknown>,
  measure: ChartMeasure,
  chartAnnotation: ChartAnnotation,
  entityType: EntityType,
  settings: ChartSettings,
  options?: ChartOptions
) {
  const category = getChartCategory(chartAnnotation)
  const category2 = getChartSeries(chartAnnotation)

  const measureProperty = getEntityProperty(entityType, measure)

  const { categoryValues, category2Values, source } = getMatrixForMeasure(
    results,
    entityType,
    category,
    category2,
    getPropertyMeasure(measure)
  )
  const [categoryAxis, valueAxis] = axisOrient(chartAnnotation.chartType.orient)
  const seriesComponents = category2Values.map((category2Value) => {
    return {
      name: category2Value.value,
      property: measureProperty,
      measure: getPropertyMeasure(measure),
      formatting: measure.formatting,
      seriesStack: category2.role === ChartDimensionRoleType.Stacked ? getPropertyMeasure(measure) : null,
      seriesLayoutBy: 'row'
    } as SeriesComponentType
  })

  console.warn(categoryValues, category2Values, seriesComponents)

  const categoryValueTexts = new Map()
  categoryValues.forEach(({value, label}) => categoryValueTexts.set(value, label))
  const category2ValueTexts = new Map()
  category2Values.forEach(({value, label}) => category2ValueTexts.set(value, label))
  const tooltip = getEChartsMatrixTooltip(
    options?.tooltip,
    getChartCategory(chartAnnotation),
    category2,
    categoryAxis,
    valueAxis,
    categoryValueTexts,
    category2ValueTexts,
    seriesComponents,
    settings
  )

  return {
    dataset: {
      id: getDatasetIdForMeasure(getPropertyMeasure(measure)),
      source
    },
    seriesComponents,
    tooltip
  }
}

export function getMatrixForMeasure(items: Array<unknown>, entityType: EntityType, category: ChartDimension, category2: ChartDimension, measure: string) {
  const categoryName = getPropertyHierarchy(category)
  const category2Name = getPropertyHierarchy(category2)
  const categoryTextName = getPropertyTextName(getEntityProperty(entityType, category))
  const category2TextName = getPropertyTextName(getEntityProperty(entityType, category2))

  // Itmes key-value 化, 解决使用 lodash find 函数速度问题
  const itemsMap = new Map()
  items.forEach((item) => {
    itemsMap.set(`${item[categoryName]}/${item[category2Name]}`, item)
  })

  const categoryValues = uniqBy(items, categoryName).map((x) => ({value: x[categoryName], label: x[categoryTextName]}))
  const category2Values = uniqBy(items, category2Name).map((x) => ({value: x[category2Name], label: x[category2TextName]}))

  const dataset = category2Values.map(({value: category2Value}, i) => {
    const values = categoryValues.map(({value: categoryValue}) => {
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
      [category2Name, ...categoryValues.map(({value}) => value)],
      ...category2Values.map(({value}, i) => [`${value}`, ...dataset[i]])
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
