import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatNativeDateModule } from '@angular/material/core'
import { ToastrService } from '@metad/cloud/state'
import { NgmDialogComponent } from '@metad/components/dialog'
import { NxSelectionModule } from '@metad/components/selection'
import { IsNilPipe, NxCoreModule } from '@metad/core'
import { NgmCommonModule, ResizerModule, TreeTableModule } from '@metad/ocap-angular/common'
import { NgmControlsModule } from '@metad/ocap-angular/controls'
import { ButtonGroupDirective, OcapCoreModule, provideOcapCore } from '@metad/ocap-angular/core'
import { NgmHierarchySelectComponent } from '@metad/ocap-angular/entity'
import { MaterialModule, SharedModule } from '../../@shared'
import { InlineSearchComponent } from '../../@shared/form-fields'
import { PACIndicatorRoutingModule } from './indicator-routing.module'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialModule,
    MatNativeDateModule,

    NxCoreModule,
    NxSelectionModule,
    ButtonGroupDirective,
    InlineSearchComponent,
    PACIndicatorRoutingModule,

    NgmDialogComponent,
    IsNilPipe,

    // OCAP Modules
    OcapCoreModule,
    NgmCommonModule,
    NgmControlsModule,
    TreeTableModule,
    ResizerModule,
    NgmHierarchySelectComponent
  ],
  providers: [provideOcapCore(), ToastrService]
})
export class PACIndicatorModule {}
