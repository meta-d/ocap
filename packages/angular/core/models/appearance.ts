import { FloatLabelType, MatFormFieldAppearance } from '@angular/material/form-field'
import { DisplayDensity } from '../directives/displayDensity'

export interface NgmAppearance {
  appearance?: MatFormFieldAppearance
  floatLabel?: FloatLabelType
  hideRequiredMarker?: boolean
  displayDensity?: DisplayDensity
}
