import {
  ChartDimension,
  ChartMeasure,
  displayByBehaviour,
  getMeasurePropertyUnit,
  getPropertyTextName,
  PrimitiveType,
  Property
} from '@metad/ocap-core'
import { find, isNumber } from 'lodash'
import { formatNumber } from './decimal'
import { FORMAT_LOCALE_DATA, SeriesComponentType } from './types'

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

/**
 * shorNumber
 * @param value 传入的需要进行 short 的数据
 * @returns null 或者 short结果数组 (例如: ['4.53', 'K'] ['5.62', '万'])
 */
export function formatShortNumber(value: number | string, locale = 'en', factor?, shortUnits?): [number, string] {
  try {
    const num = strToNumber(value)
    const localeData = FORMAT_LOCALE_DATA[locale]
    factor = factor || localeData?.shortNumberFactor
    shortUnits = shortUnits || localeData?.shortNumberUnits

    let resultValue = num
    let resultName = ''

    const units = shortUnits.split(',').reverse()
    units.every((unitName, i) => {
      const rounder = Math.pow(10, (units.length - i) * factor)
      if (Math.abs(num) >= rounder) {
        resultValue = num / rounder
        resultName = unitName
        return false
      }
      return true
    })

    return [Number(resultValue), resultName]
  } catch (error: any) {
    throw new Error('Invalid Short Number Argument')
  }
}

/**
 * Transforms a string into a number (if needed).
 */
function strToNumber(value: number | string): number {
  // Convert strings to numbers
  if (typeof value === 'string' && !isNaN(Number(value) - parseFloat(value))) {
    return Number(value)
  }
  if (typeof value !== 'number') {
    throw new Error(`${value} is not a number`)
  }
  return value
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
export function echartsFormatNumber(value, digitInfo?: string, shortNumber?: boolean, locale?: string) {
  if (isNumber(value)) {
    if (shortNumber) {
      const [short, unit] = formatShortNumber(value, locale)
      return formatNumber(short, locale, digitInfo) + unit
    }
    return formatNumber(value, locale, digitInfo)
  }

  return '-'
}
