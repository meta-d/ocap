import { ChartAnnotation, ChartSettings, DataSettings, Indicator, ISlicer, OrderBy } from '@metad/ocap-core'

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
  orders?: OrderBy[]
  top?: number
}

export function isQuestionAnswer(input: unknown): input is QuestionAnswer {
  return typeof (input as QuestionAnswer).key === 'string'
}