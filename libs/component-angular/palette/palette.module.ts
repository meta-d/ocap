import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { NxScaleChromaticComponent } from './scale-chromatic/scale-chromatic.component'
import { NxScaleChromaticDirective } from './scale-chromatic/scale-chromatic.directive'

@NgModule({
  declarations: [
    NxScaleChromaticDirective,
    NxScaleChromaticComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MatDialogModule,
    MatButtonModule
  ],
  exports: [
    NxScaleChromaticDirective,
    NxScaleChromaticComponent,
  ]
})
export class NxPaletteModule {}
