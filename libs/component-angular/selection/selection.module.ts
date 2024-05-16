import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatSelectModule } from '@angular/material/select'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTooltipModule } from '@angular/material/tooltip'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { NgmControlsModule } from '@metad/ocap-angular/controls'
import { ButtonGroupDirective, OcapCoreModule } from '@metad/ocap-angular/core'
import { NgmEntityModule, NgmEntityPropertyComponent } from '@metad/ocap-angular/entity'
import { TranslateModule } from '@ngx-translate/core'
import { NxEntityModule } from '@metad/components/entity'
import { PropertyModule } from '@metad/components/property'
import { AdvancedSlicerComponent } from './advanced-slicer/advanced-slicer.component'
import { SlicerBarComponent } from './slicer-bar/slicer-bar.component'
import { SlicerComponent } from './slicer/slicer.component'
import { SlicersComponent } from './slicers/slicers.component'
import { NgmParameterModule } from '@metad/ocap-angular/parameter'

@NgModule({
  declarations: [SlicerComponent, SlicersComponent, SlicerBarComponent, AdvancedSlicerComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDividerModule,
    MatMenuModule,
    MatSelectModule,
    TranslateModule,

    NxEntityModule,
    PropertyModule,

    // OCAP Modules
    NgmControlsModule,
    OcapCoreModule,
    NgmCommonModule,
    NgmEntityPropertyComponent,
    ButtonGroupDirective,
    NgmParameterModule,
    NgmEntityModule
  ],
  exports: [SlicerComponent, SlicersComponent, SlicerBarComponent, AdvancedSlicerComponent]
})
export class NxSelectionModule {}
