import { ISlicer } from '../types'

export interface ChartSettings {
  /**
   * 图形主题
   */
  theme?: string
  /**
   * Locale / Language
   */
  locale?: string

  digitInfo?: string
  /**
   * 格子横向个数
   */
  trellisHorizontal?: number
  /**
   * 格子纵向个数
   */
  trellisVertical?: number

  /**
   * 对应 ECharts 的 Universal Transition
   */
  universalTransition?: boolean
}

export interface ChartOptions {
  options?: any
  tooltip?: any
}

export interface IChartClickEvent {
  filter?: ISlicer
  item?: any
  data: any
  event: MouseEvent
}

export interface IChartSelectedEvent {
  slicers: ISlicer[]
  event: MouseEvent
}
