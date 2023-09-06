import { ThemePalette } from '@angular/material/core'
import { FloatLabelType, MatFormFieldAppearance } from '@angular/material/form-field'
import { DisplayDensity } from '../directives/displayDensity'

export interface NgmAppearance {
  appearance?: MatFormFieldAppearance
  floatLabel?: FloatLabelType
  color?: ThemePalette
  hideRequiredMarker?: boolean
  displayDensity?: DisplayDensity
}
