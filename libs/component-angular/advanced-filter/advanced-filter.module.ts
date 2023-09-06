import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { PropertyModule } from '@metad/components/property'
import { NxAdvancedFilterComponent } from './advanced-filter.component'

/**
 * "Advanced Filter" 同 "Combination Slicer" 
 */
@NgModule({
  declarations: [NxAdvancedFilterComponent],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    TranslateModule,

    PropertyModule,
    ButtonGroupDirective,
    DensityDirective,
    AppearanceDirective
  ],
  exports: [NxAdvancedFilterComponent]
})
export class NxAdvancedFilterModule {}
