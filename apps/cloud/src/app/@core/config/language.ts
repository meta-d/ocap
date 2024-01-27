export enum LanguagesEnum {
  Chinese = 'zh-CN',
  SimplifiedChinese = 'zh-Hans',
  TraditionalChinese = 'zh-Hant',
  English = 'en'
}

export const LanguagesMap = {
  'zh-CN': LanguagesEnum.SimplifiedChinese,
  'zh-Hans': LanguagesEnum.SimplifiedChinese,
  zh: LanguagesEnum.SimplifiedChinese,
  'zh-HK': LanguagesEnum.TraditionalChinese,
}
