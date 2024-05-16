import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatBadgeModule } from '@angular/material/badge'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { NxEditorModule } from '@metad/components/editor'
import { NxEntityModule } from '@metad/components/entity'
import { NgmSearchComponent, NgmSelectComponent, ResizerModule } from '@metad/ocap-angular/common'
import { NgmControlsModule } from '@metad/ocap-angular/controls'
import { ButtonGroupDirective, DensityDirective, OcapCoreModule } from '@metad/ocap-angular/core'
import {
  NgmEntityModule,
  NgmEntityPropertyComponent,
  NgmEntitySchemaComponent,
  NgmHierarchySelectComponent
} from '@metad/ocap-angular/entity'
import { TranslateModule } from '@ngx-translate/core'
import { PropertyMemberSelectComponent } from './member-select/member-select.component'

/**
 * @deprecated use NgmEntityModule instead
 */
@NgModule({
  declarations: [PropertyMemberSelectComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatMenuModule,
    MatRadioModule,
    MatListModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    NxEditorModule,

    DragDropModule,
    TranslateModule,
    NxEntityModule,

    // OCAP Modules
    OcapCoreModule,
    NgmControlsModule,
    NgmEntityPropertyComponent,
    NgmHierarchySelectComponent,
    ResizerModule,
    NgmEntitySchemaComponent,
    ButtonGroupDirective,
    NgmSelectComponent,
    DensityDirective,

    NgmEntityModule,
    NgmSearchComponent
  ],
  exports: [PropertyMemberSelectComponent]
})
export class PropertyModule {}
