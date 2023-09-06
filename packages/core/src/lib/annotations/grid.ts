import { Annotation, Dimension } from '../types'
import { DataFieldAbstract } from './ui'

export interface HeaderInfoAnnotation extends Annotation {
  typeNamePlural: string
}

export interface LineItemAnnotation extends Annotation {
  dataFields: Array<Dimension | DataFieldAbstract>
}
