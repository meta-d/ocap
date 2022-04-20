import {
  ChartDimension,
  ChartMeasure,
  ChartMeasureRoleType,
  displayByBehaviour,
  getMeasurePropertyUnit,
  getPropertyTextName,
  getPropertyUnitName,
  PrimitiveType,
  Property
} from '@metad/ocap-core'
import { find, isNumber } from 'lodash'
import { AxisEnum, SeriesComponentType } from './types'

/**
 * 计算出 ECharts tooltip 配置
 *
 * @param tooltipOptions
 * @param dimProperty
 * @param measures
 * @param seriesComponents
 * @param locale
 * @returns
 */
export function getEChartsTooltip(
  tooltipOptions,
  dimProperty: Property,
  measures: Array<{ measure: ChartMeasure; property: Property }>,
  seriesComponents: SeriesComponentType[],
  locale: string,
  rowRuler = (data) => data
) {
  const tooltip: any = {
    trigger: tooltipOptions?.trigger || 'item'
  }

  const tooltipMeasures = measures.filter(({ measure }) => measure.role === ChartMeasureRoleType.Tooltip)

  tooltip.formatter = (params: any) => {
    const texts = []
    if (Array.isArray(params)) {
      params = params.filter((param) => {
        return (
          seriesComponents[param.seriesIndex] &&
          !seriesComponents[param.seriesIndex].noDisplay &&
          param.data[param.seriesName] !== '-'
        )
      })

      const param = params[0]
      texts.push(_formatDimensionValue(rowRuler(param.data), dimProperty))
      params.forEach((param) => {
        // const property = seriesComponents[param.seriesIndex].property
        const measure = measures.find((item) => item.measure.measure === seriesComponents[param.seriesIndex].measure)
        const row = rowRuler(param.data)
        texts.push(param.marker + formatMeasureLabel(row, measure, locale, tooltipOptions?.shortNumber))
      })

      tooltipMeasures.forEach((measure) => {
        const row = rowRuler(param.data)
        texts.push(param.marker + formatMeasureLabel(row, measure, locale, tooltipOptions?.shortNumber))
      })
    } else {
      const row = rowRuler(params.data)
      texts.push(params.marker + _formatDimensionValue(row, dimProperty))
      texts.push(formatMeasuresLabel(row, measures, locale, tooltipOptions?.shortNumber))
    }

    return texts.join('<br>')
  }

  return tooltip
}

export function getEChartsMatrixTooltip(
  tooltipOptions: any,
  chartCategory: ChartDimension,
  seriesCategory: ChartDimension,
  _categoryAxis: AxisEnum,
  _valueAxis: AxisEnum,
  categoryValueTexts: Map<string, string>,
  seriesValueTexts: Map<string, string>,
  seriesComponents: SeriesComponentType[],
  locale: string,
  settings: any
) {
  const tooltip: any = {
    trigger: tooltipOptions?.trigger || 'item'
  }

  const short = tooltipOptions?.shortNumber
  const showMeasureName = tooltipOptions?.showMeasureName
  const categoryAxis = AxisEnum[_categoryAxis]
  const valueAxis = AxisEnum[_valueAxis]

  // 如果 multiple or stacked 图是以 category 字段为 series 则重写 formatter 方法以适应
  tooltip.formatter = (params: any) => {
    const texts = []
    if (Array.isArray(params)) {
      params = params.filter((param) => {
        return (
          seriesComponents[param.seriesIndex] &&
          !seriesComponents[param.seriesIndex].noDisplay &&
          param.data[param.seriesName] !== '-'
        )
      })
      texts.push(
        formatCategoryLabel(params[0].data[params[0].encode[categoryAxis][0]], categoryValueTexts, chartCategory)
      )

      params
        .filter((param) => {
          const value = param.data[param.encode[valueAxis][0]]
          return value !== undefined && value !== '-'
        })
        .forEach((param) => {
          const unitName = getPropertyUnitName(seriesComponents[param.seriesIndex]?.property)
          let unit: any = ''
          if (unitName) {
            unit = param.data[param.data.length - 1][unitName]
            if (unit === 'P1') {
              unit = '%'
            }
          }
          if (seriesComponents[param.seriesIndex]?.formatting?.unit) {
            unit = seriesComponents[param.seriesIndex]?.formatting?.unit
          }
          let text = `${param.marker}${formatCategoryLabel(
            param.dimensionNames[param.encode[valueAxis][0]],
            seriesValueTexts,
            seriesCategory
          )}`
          if (showMeasureName) {
            texts.push(text)
            texts.push(
              `${getSeriesComponentMeasureName(seriesComponents, param.seriesIndex)}: ${echartsFormatNumber(
                param.data[param.encode[valueAxis][0]],
                settings,
                short,
                locale
              )} ${unit}`
            )
          } else {
            text = `${text}: ${echartsFormatNumber(
              param.data[param.encode[valueAxis][0]],
              settings,
              short,
              locale
            )} ${unit}`
            texts.push(text)
          }
        })
    } else {
      texts.push(formatCategoryLabel(params.data[params.encode[categoryAxis][0]], categoryValueTexts, chartCategory))

      texts.push(
        formatCategoryLabel(params.dimensionNames[params.encode[valueAxis][0]], seriesValueTexts, seriesCategory)
      )

      // 判断 进行 数据简化操作 还是进行 数据格式化操作
      texts.push(
        `${params.marker} ${getSeriesComponentMeasureName(seriesComponents, params.seriesIndex)}: ${echartsFormatNumber(
          params.data[params.encode[valueAxis][0]],
          settings,
          short,
          locale
        )}`
      )
    }

    return texts.join('<br>')
  }

  return tooltip
}

export function getSeriesComponentMeasureName(seriesComponents: Array<SeriesComponentType>, i: number) {
  const component = seriesComponents[i]
  return component?.property?.label || component?.property?.name
}

export function formatCategoryLabel(
  value: PrimitiveType,
  valueTexts: Map<PrimitiveType, string>,
  category: ChartDimension
) {
  const label = valueTexts?.get(value) || ''
  return displayByBehaviour({ value, label }, category.displayBehaviour)
}

/**
 * 数字缩写格式化
 * @param value 数字
 * @param shortNumber 数字是否缩写
 */
export function echartsFormatNumber(value, settings?: any, shortNumber?: boolean, locale?: string) {
  if (isNumber(value)) {
    if (shortNumber) {
      const [short, unit] = formatShortNumber(value, locale)
      return formatNumber(short, locale, settings?.digitInfo) + unit
    }
    return formatNumber(value, locale, settings?.digitInfo)
  }

  return '-'
}

/**
 * 度量的数字缩写格式化
 *
 * @param measure 度量
 * @param value 数值
 * @param locale 地区
 * @param shortNumber 是否缩短
 * @returns
 */
export function formatMeasureNumber(
  {
    measure,
    property
  }: {
    measure: ChartMeasure
    property: Property
  },
  value: number | string,
  locale: string,
  shortNumber?: boolean
) {
  if (isNumber(value)) {
    const digitInfo = `0.0-${measure.formatting?.decimal ?? 1}`
    const unit = measure.formatting?.unit ?? getMeasurePropertyUnit(property)
    if (unit === '%') {
      value = value * 100
    }
    if (measure.formatting?.shortNumber ?? shortNumber) {
      const [short, shortUnit] = formatShortNumber(value, locale)
      return formatNumber(short, locale, digitInfo) + shortUnit + (unit ?? '')
    }
    return formatNumber(value, locale, digitInfo) + (unit ?? '')
  }

  return null
}

export function _formatDimensionValue(item, dimProperty?: Property | null) {
  if (!item || !dimProperty) {
    return ''
  }

  if (dimProperty?.dataType === 'Edm.DateTime') {
    if (dimProperty.displayFormat === 'Date') {
      return format(item[dimProperty.name], 'yyyy-MM-dd')
    }
    // TODO
    return format(item[dimProperty.name], 'yyyy-MM-dd')
  }

  return displayByBehaviour(
    {
      value: item[dimProperty?.name],
      label: item[getPropertyTextName(dimProperty)]
    }
    // dimProperty?.displayBehaviour
  )
}

export function formatMeasureLabel(
  item: unknown,
  {
    measure,
    property
  }: {
    measure: ChartMeasure
    property: Property
  },
  locale: string,
  shortNumber?: boolean
) {
  if (!item) {
    return '-'
  }

  const value = formatMeasureNumber({ measure, property }, item[measure.measure], locale, shortNumber)
  return `${property?.label || measure.measure}: ${value ?? item[measure.measure] ?? '-'}`
}

export function formatMeasuresLabel(
  item: unknown,
  measures: Array<{ measure: ChartMeasure; property: Property }>,
  locale: string,
  shortNumber?: boolean
) {
  if (!item) {
    return '-'
  }

  return measures
    .map(({ measure, property }) => {
      return formatMeasureLabel(item, { measure, property }, locale, shortNumber)
    })
    .join('<br>')
}

export function setCategoryAxisLabel(category, items, chartCategory: ChartDimension, property: Property) {
  // 暂时只支持一个 dimension
  const behaviour = chartCategory.displayBehaviour

  category.axisLabel = category.axisLabel || {}
  category.axisLabel.formatter = (value, index) => {
    const textName = getPropertyTextName(property)
    if (textName) {
      const item = find(items, (item) => item[property.name] == value)
      if (item) {
        return displayByBehaviour({ value: item[property.name], label: item[textName] }, behaviour)
      }
    }

    return value
  }
  if (category.type === 'time' || property.type === 'Edm.DateTime') {
    category.axisLabel.formatter = (value, index) => {
      // let date = new Date();
      return format(value, 'yyyy-MM-dd') // date.getFullYear(), date.getMonth() + 1, date.getDate()].join('/');
    }
  }
}

export function format(value, formatter) {
  return 'XXXXXXX'
}

export function formatShortNumber(value, locale?: string) {
  return [value]
}

export function formatNumber(short: number, locale: string, digitInfo?: string) {
  return short
}
