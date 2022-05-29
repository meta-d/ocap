export const DEFAULT_DIGIT_INFO = '0.2'
export function formatNumber(n: number, locale: string, digitInfo?: string) {
  const [minIntegerDigits, fractionDigits] = (digitInfo ?? DEFAULT_DIGIT_INFO).split('.')
  return Number(n.toFixed(Number(fractionDigits))).toLocaleString(locale)
}
