import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatNativeDateModule } from '@angular/material/core'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatRadioModule } from '@angular/material/radio'
import { TranslateModule } from '@ngx-translate/core'
import {
  NgmMemberDatepickerComponent,
  NxMonthFilterComponent,
  NxQuarterFilterComponent,
  NxYearFilterComponent
} from './datepicker.component'
import { NgmMonthpickerComponent } from './monthpicker/monthpicker.component'
import { NgmQuarterpickerComponent } from './quarterpicker/quarterpicker.component'
import { NgmYearpickerComponent } from './yearpicker/yearpicker.component'
import { NgmDatepickerComponent } from './datepicker/datepicker.component'

@NgModule({
  declarations: [NgmMemberDatepickerComponent, NxQuarterFilterComponent, NxMonthFilterComponent, NxYearFilterComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatButtonModule,
    MatMenuModule,
    MatInputModule,
    MatRadioModule,
    MatIconModule,

    TranslateModule,

    NgmMonthpickerComponent,
    NgmQuarterpickerComponent,
    NgmYearpickerComponent,
    NgmDatepickerComponent
  ],
  exports: [NgmMemberDatepickerComponent]
})
export class NgmMemberDatepickerModule {}
