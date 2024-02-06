import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatNativeDateModule } from '@angular/material/core'
import { NgmCommonModule, ResizerModule, TreeTableModule } from '@metad/ocap-angular/common'
import { ControlsModule } from '@metad/ocap-angular/controls'
import { ButtonGroupDirective, OcapCoreModule } from '@metad/ocap-angular/core'
import { NgmHierarchySelectComponent } from '@metad/ocap-angular/entity'
import { FormulaModule } from '@metad/ocap-angular/formula'
import { ToastrService } from '@metad/cloud/state'
import { CalculatedMeasureComponent } from '@metad/components/property'
import { NgmDialogComponent } from '@metad/components/dialog'
import { NxSelectionModule } from '@metad/components/selection'
import { IsNilPipe, NxCoreModule } from '@metad/core'
import { MonacoEditorModule } from 'ngx-monaco-editor'
import { MaterialModule, SharedModule } from '../../@shared'
import { InlineSearchComponent } from '../../@shared/form-fields'
import { PACIndicatorRoutingModule } from './indicator-routing.module'

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialModule,
    MatNativeDateModule,
    MonacoEditorModule.forRoot(),

    NxCoreModule,
    NxSelectionModule,
    ButtonGroupDirective,
    InlineSearchComponent,
    PACIndicatorRoutingModule,

    NgmDialogComponent,
    CalculatedMeasureComponent,
    IsNilPipe,

    // OCAP Modules
    OcapCoreModule.forRoot(),
    NgmCommonModule,
    ControlsModule,
    TreeTableModule,
    FormulaModule,
    ResizerModule,
    NgmHierarchySelectComponent,
  ],
  providers: [ToastrService]
})
export class PACIndicatorModule {}
