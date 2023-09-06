export const DEFAULT_DIGIT_INFO = '0.2'

export const FORMAT_LOCALE_DATA = {
  en: {
    lang: 'en-US',
    shortNumberFactor: 3,
    shortNumberUnits: 'K,M,B,T,Q'
  },
  'zh-Hans': {
    lang: 'zh-Hans',
    shortNumberFactor: 4,
    shortNumberUnits: '万,亿,万亿'
  }
}

export function formatNumber(n: number, locale: string, digitsInfo?: string) {
  let [, fractionDigits] = (digitsInfo ?? DEFAULT_DIGIT_INFO).split('.')
  fractionDigits = fractionDigits.split('-')[1] ?? fractionDigits
  return Number(n.toFixed(Number(fractionDigits))).toLocaleString(locale ?? 'en')
}

/**
 * Transforms a string into a number (if needed).
 */
export function strToNumber(value: number | string): number {
  // Convert strings to numbers
  if (typeof value === 'string' && !isNaN(Number(value) - parseFloat(value))) {
    return Number(value)
  }
  if (typeof value !== 'number') {
    throw new Error(`${value} is not a number`)
  }
  return value
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
