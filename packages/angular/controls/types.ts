import { FilterSelectionType, SmartFilterDataOptions } from '@metad/ocap-core'


export interface ControlOptions extends SmartFilterDataOptions {
  selectionType?: FilterSelectionType
  searchable?: boolean

  /**
   * 初始展示层级深度
   */
  initialLevel?: number
}
