import { Annotation, PropertyPath } from '../types'
import { DataFieldAbstract } from './ui'

export interface HeaderInfoAnnotation extends Annotation {
  typeNamePlural: string
}

export interface LineItemAnnotation extends Annotation {
  dataFields: Array<PropertyPath | DataFieldAbstract>
}
