import { PresentationVariant, SelectionVariant } from './annotations'
import { ChartAnnotation } from './annotations/chart'

export interface DataSettings {
  dataSource: string
  entitySet: string
  chartAnnotation?: ChartAnnotation,
  selectionVariant?: SelectionVariant
  presentationVariant?: PresentationVariant
}
