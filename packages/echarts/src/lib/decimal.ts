export const DEFAULT_DIGIT_INFO = '0.2'
export function formatNumber(short: number, locale: string, digitInfo?: string) {
  const [minIntegerDigits, fractionDigits] = (digitInfo ?? DEFAULT_DIGIT_INFO).split('.')
  return Number(short.toFixed(Number(fractionDigits))).toLocaleString(locale)
}
