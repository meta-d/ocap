import { IIndicator, TimeGranularity } from '@metad/contracts'
import { DataSettings, Indicator } from '@metad/ocap-core'

export { IndicatorTagEnum } from '@metad/contracts'

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

export const ItemMaxLookback = 30
export const LookbackDefault = {
  [TimeGranularity.Year]: 5,
  [TimeGranularity.Quarter]: 8,
  [TimeGranularity.Month]: 24,
  [TimeGranularity.Week]: 24,
  [TimeGranularity.Day]: 30
}

export const LookbackLimit = {
  [TimeGranularity.Year]: 10,
  [TimeGranularity.Quarter]: 40,
  [TimeGranularity.Month]: 120,
  [TimeGranularity.Week]: 240,
  [TimeGranularity.Day]: 365
}