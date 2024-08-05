import {
  AnalyticsAnnotation,
  IdentificationAnnotation,
  PresentationVariant,
  SelectionFieldsAnnotation,
  SelectionPresentationVariant,
  SelectionVariant,
  ValueListAnnotation
} from './annotations'
import { ChartAnnotation } from './annotations/chart'
import { KPIType } from './annotations/kpi'
import { Dimension } from './types'
import { isNil } from './utils'

export interface DataSettings {
  /**
   * The semantic model id
   */
  modelId?: string
  /**
   * The name of dataSource: key of semantic model
   */
  dataSource: string
  /**
   * The cube name in dataSource
   */
  entitySet: string
  
  dimension?: Dimension
  chartAnnotation?: ChartAnnotation
  selectionVariant?: SelectionVariant
  presentationVariant?: PresentationVariant
  selectionPresentationVariant?: Array<SelectionPresentationVariant>

  analytics?: AnalyticsAnnotation
  selectionFieldsAnnotation?: SelectionFieldsAnnotation
  valueListAnnotation?: ValueListAnnotation
  KPIAnnotation?: KPIType
  identificationAnnotation?: IdentificationAnnotation

  lazyInit?: boolean
}

// type Guards
export const isDataSettings = (toBe): toBe is DataSettings =>
  !isNil(toBe?.dataSource) && !isNil(toBe?.entitySet)
