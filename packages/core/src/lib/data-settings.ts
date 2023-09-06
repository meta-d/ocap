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

export interface DataSettings {
  dataSource: string
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
