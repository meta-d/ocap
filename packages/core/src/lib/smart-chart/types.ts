export interface ChartSettings {
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
  options: any
  tooltip?: any
}