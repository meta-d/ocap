import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatRadioModule } from '@angular/material/radio'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { ParameterComponent } from './parameter/parameter.component'


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatListModule,

    OcapCoreModule
  ],
  exports: [ParameterComponent],
  declarations: [ParameterComponent],
  providers: []
})
export class ParameterModule {}
