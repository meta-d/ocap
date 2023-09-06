import { ChartType } from '../annotations'
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

  /**
   * digitsInfo for number formater 
   */
  digitsInfo?: string
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

  /**
   * The maximum limit of data that show in chart
   */
  maximumLimit?: number

  /**
   * standby chart types for chart annotation
   */
  chartTypes?: ChartType[]
}

export interface ChartOptions {
  options?: any
  tooltip?: any
  axis?: any
  visualMap?: any
  dataZoom?: any
  [key: string]: any
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
