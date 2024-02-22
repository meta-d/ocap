import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatChipsModule } from '@angular/material/chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatRadioModule } from '@angular/material/radio'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { DensityDirective } from '@metad/ocap-angular/core'
import { NgmEntityPropertyComponent } from '@metad/ocap-angular/entity'
import { NgmParameterComponent } from '@metad/ocap-angular/parameter'
import { TranslateModule } from '@ngx-translate/core'
import { NxEntityModule } from '@metad/components/entity'
import { NgmMemberDatepickerModule } from '@metad/components/datepicker'
import { NxInputControlComponent } from './input-control.component'
import { NgmControlsModule } from '@metad/ocap-angular/controls'
import { InputControlPlaceholderComponent } from './placeholder/placeholder.component'

@NgModule({
  declarations: [NxInputControlComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    TranslateModule,
    
    DensityDirective,
    NxEntityModule,
    NgmMemberDatepickerModule,
    NgmCommonModule,
    NgmParameterComponent,
    NgmEntityPropertyComponent,
    NgmControlsModule,
    InputControlPlaceholderComponent
  ],
  exports: [NxInputControlComponent]
})
export class InputControlModule {}
