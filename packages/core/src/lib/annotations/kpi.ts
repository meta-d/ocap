import { PresentationVariant } from './presentation'
import { SelectionVariant } from './selection'
import { DataPointType } from './ui'

/**
 * Reference [KPIType](https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#KPIType)
 */
export interface KPIType {
  ID?: string // Optional identifier to reference this instance from an external context
  /**
   * @experimental
   */
  ShortDescription: string // Very short description
  SelectionVariant: SelectionVariant // Selection variant, either specified inline or referencing another annotation via Path
  DataPoint: Partial<DataPointType> // Data point, either specified inline or referencing another annotation via Path
  /**
   * Additional data points, either specified inline or referencing another annotation via Path
   * Additional data points are typically related to the main data point and provide complementing information
   * or could be used for comparisons
   */
  AdditionalDataPoints: Partial<DataPointType>[]

  Detail: KPIDetailType // Contains information about KPI details, especially drill-down presentations
}

export interface KPIDetailType {
  // Presentation variant, either specified inline or referencing another annotation via Path
  DefaultPresentationVariant: PresentationVariant
  // A list of alternative presentation variants, either specified inline or referencing another annotation via Path
  AlternativePresentationVariants: PresentationVariant[]
  // Name of the Semantic Object. If not specified, use Semantic Object annotated at the property referenced in KPI/DataPoint/Value
  SemanticObject: string
  // Name of the Action on the Semantic Object. If not specified, let user choose which of the available actions to trigger.
  Action: string
}
