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

export interface DataSettings {
  dataSource: string
  entitySet: string
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
