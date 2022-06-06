import { FloatLabelType, MatFormFieldAppearance } from '@angular/material/form-field'
import { FilterSelectionType, SmartFilterDataOptions } from '@metad/ocap-core'
import { DisplayDensity } from '@metad/ocap-angular/core'

export interface ControlOptions extends SmartFilterDataOptions {
  appearance?: MatFormFieldAppearance
  floatLabel?: FloatLabelType
  hideRequiredMarker?: boolean
  displayDensity?: DisplayDensity
  selectionType?: FilterSelectionType
  searchable?: boolean
}
