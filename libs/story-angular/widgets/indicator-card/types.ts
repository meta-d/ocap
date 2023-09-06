
export enum WidgetComponentType {
  IndicatorCard = 'IndicatorCard',
}

export enum CardType {
  COMMON = 'common',
  RATIO = 'ratio'
}

export enum YoyType {
  PROPORTION = 'proportion',
  GAP = 'gap'
}

export interface IndicatorOption {
  /**
   * Code of indicator
   */
  code: string
  /**
   * Alias title of indicator
   */
  title: string
  digitsInfo: string
  disabledYoy: false
  yoyType: YoyType
  cost: boolean
}

export interface IndicatorOptions extends IndicatorOption {
  disabledTrend: boolean
  lookBack?: number
  indicators: Array<IndicatorOption>
}

export enum ArrowDirection {
  UP = 'UP',
  DOWN = 'DOWN'
}

export interface IndicatorResult {
  currentValue: string
  shortUnit: string
  currentUnit: string
  currentArrow?: ArrowDirection
  yoyValue?: string
  yoyUnit?: string
  yoyArrow?: ArrowDirection
}
