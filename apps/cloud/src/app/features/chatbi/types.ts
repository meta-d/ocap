import { ChartAnnotation, ChartSettings, DataSettings, Indicator, ISlicer } from '@metad/ocap-core'

export interface QuestionAnswer {
  key: string
  chartOptions: any
  dataSettings: DataSettings
  chartSettings: ChartSettings
  options?: any
  expanded: boolean
  /**
   * @deprecated 还在用吗？
   */
  message: string
  slicers: ISlicer[]
  /**
   * Snapshot of ids of current indicators (i.e. calculated measures)
   */
  indicators: string[]
  /**
   * @deprecated 还在用吗？
   */
  title: string
  visualType?: 'table' | 'chart'
  chartAnnotation?: ChartAnnotation
  variables?: ISlicer[]
}
