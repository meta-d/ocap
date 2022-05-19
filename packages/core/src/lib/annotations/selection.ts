import { Annotation, Dimension, IFilter, ISlicer } from '../types'
import { ChartAnnotation } from './chart'
import { PresentationVariant } from './presentation'

/**
 */
export interface SelectionVariant {
  id?: string
  text?: string
  parameters?: {
    [key: string]: any
  }
  selectOptions?: Array<ISlicer | IFilter | string>
  /**
   * Filter string for query part of URL, without `$filter=`
   * @todo
   */
  filterExpression?: string
}

export interface SelectionFieldsAnnotation extends Annotation {
  propertyPaths: Array<Dimension>
}

/**
 * see [SelectionPresentationVariantType](https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#SelectionPresentationVariantType)
 */
export interface SelectionPresentationVariant {
  default?: boolean
  // Optional identifier to reference this variant from an external context
  id?: string
  // Name of the bundling variant
  label?: string
  // Selection variant, either specified inline or referencing another annotation via Path
  selectionVariant?: SelectionVariant
  // Presentation variant, either specified inline or referencing another annotation via Path
  presentationVariant?: PresentationVariant
  chartAnnotation?: ChartAnnotation
}
