import localeEn from './locale_en'
/**
 * This const is used to store the locale data registered with `registerLocaleData`
 */
const LOCALE_DATA: { [localeId: string]: any } = {}

/**
 * Index of each type of locale data from the locale data array
 */
export enum LocaleDataIndex {
  LocaleId = 0,
  DayPeriodsFormat,
  DayPeriodsStandalone,
  DaysFormat,
  DaysStandalone,
  MonthsFormat,
  MonthsStandalone,
  Eras,
  FirstDayOfWeek,
  WeekendRange,
  DateFormat,
  TimeFormat,
  DateTimeFormat,
  NumberSymbols,
  NumberFormats,
  CurrencyCode,
  CurrencySymbol,
  CurrencyName,
  Currencies,
  Directionality,
  PluralCase,
  ExtraData,
}

/**
 * Register locale data to be used internally by Angular. See the
 * ["I18n guide"](guide/i18n#i18n-pipes) to know how to import additional locale data.
 *
 * The signature `registerLocaleData(data: any, extraData?: any)` is deprecated since v5.1
 */
function registerLocaleData(data: any, localeId?: string | any, extraData?: any): void {
  if (typeof localeId !== 'string') {
    extraData = localeId
    localeId = data[LocaleDataIndex.LocaleId]
  }

  localeId = localeId.toLowerCase().replace(/_/g, '-')

  LOCALE_DATA[localeId] = data

  if (extraData) {
    LOCALE_DATA[localeId][LocaleDataIndex.ExtraData] = extraData
  }
}

/**
 * Finds the locale data for a given locale.
 *
 * @param locale The locale code.
 * @returns The locale data.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 */
export function findLocaleData(locale: string): any {
  const normalizedLocale = normalizeLocale(locale)

  let match = getLocaleData(normalizedLocale)
  if (match) {
    return match
  }

  // let's try to find a parent locale
  const parentLocale = normalizedLocale.split('-')[0]
  match = getLocaleData(parentLocale)
  if (match) {
    return match
  }

  if (parentLocale === 'en') {
    return localeEn
  }

  throw new Error(`Missing locale data for the locale "${locale}".`)
}

/**
 * Helper function to get the given `normalizedLocale` from `LOCALE_DATA`
 * or from the global `ng.common.locale`.
 */
export function getLocaleData(normalizedLocale: string): any {
  return LOCALE_DATA[normalizedLocale]
}

/**
 * Returns the canonical form of a locale name - lowercase with `_` replaced with `-`.
 */
function normalizeLocale(locale: string): string {
  return locale.toLowerCase().replace(/_/g, '-')
}
