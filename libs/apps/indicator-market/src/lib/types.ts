import { IIndicator } from '@metad/contracts'
import { DataSettings, Indicator } from '@metad/ocap-core'

export enum TagEnum {
  UNIT,
  MOM,
  YOY
}

export enum Trend {
  None,
  Up,
  Down
}

export enum TrendColor {
  None = '#40A9FF',
  Up = '#31c75a',
  Down = '#fe3c2e'
}

export enum TrendReverseColor {
  None = '#40A9FF',
  Down = '#31c75a',
  Up = '#fe3c2e'
}

export interface IndicatorState extends Partial<Indicator>, Omit<IIndicator, 'type'> {
  initialized: boolean
  loaded: boolean
  lookBack: number
  dataSettings: DataSettings
  data: { CURRENT?: number; [key: string]: any }
  trends: Array<unknown>
  trend: Trend
  favour: boolean
  error?: string
}

// 分批请求的批次大小
export const INDICATOR_BATCH_SIZE = 50
export enum StatisticalType {
  CurrentPeriod = 'CurrentPeriod',
  Accumulative = 'Accumulative',
  Yoy = 'Yoy',
  Mom = 'Mom'
}

export enum StatisticalTypeText {
  CurrentPeriodText = '当期',
  AccumulativeText = '累计',
  YoyText = '同比',
  MomText = '环比',

  CurrentYoyText = '当期同比',
  CurrentMomText = '当期环比',
  AccumulativeYoyText = '累计同比'
}
