import { CommonModule } from '@angular/common'
import { Component, forwardRef } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { MAT_DATE_FORMATS } from '@angular/material/core'
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker'
import { MatInputModule } from '@angular/material/input'
import { NgmInputComponent } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { getMonth, getYear, setMonth, setYear } from 'date-fns'

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDatepickerModule, MatInputModule, OcapCoreModule, NgmInputComponent],
  selector: 'ngm-monthpicker',
  templateUrl: './monthpicker.component.html',
  styleUrls: ['./monthpicker.component.scss'],
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: `yyyyMM`
        },
        display: {
          dateInput: `yyyyMM`,
          monthYearLabel: 'LLL y',
          dateA11yLabel: 'MMMM d, y',
          monthYearA11yLabel: 'MMMM y'
        }
      }
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgmMonthpickerComponent),
      multi: true
    }
  ]
})
export class NgmMonthpickerComponent implements ControlValueAccessor {
  date = new FormControl(new Date())

  /**
   * Invoked when the model has been changed
   */
  onChange: (_: any) => void = (_: any) => {}
  /**
   * Invoked when the model has been touched
   */
  onTouched: () => void = () => {}

  chosenYearHandler(event) {
    const ctrlValue = this.date.value ?? new Date()
    this.date.setValue(setYear(ctrlValue, getYear(event)))
  }

  chosenMonthHandler(event, datepicker: MatDatepicker<any>) {
    const ctrlValue = this.date.value ?? new Date()
    this.date.setValue(setMonth(ctrlValue, getMonth(event)))
    datepicker.close()
    this.onChange(this.date.value)
  }

  writeValue(obj: any): void {
    this.date.setValue(obj)
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.date.disable() : this.date.enable()
  }
}
