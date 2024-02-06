import { Component, forwardRef, HostBinding, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms'
import { MAT_DATE_FORMATS } from '@angular/material/core'
import { MatDatepicker } from '@angular/material/datepicker'
import { DisplayDensity, NgmAppearance, NgmDSCoreService } from '@metad/ocap-angular/core'
import { TimeGranularity } from '@metad/ocap-core'
import { NxCoreService, TIME_GRANULARITY_SEQUENCES } from '@metad/core'
import { getMonth, getYear, isDate, setMonth, setYear } from 'date-fns'
import { filter } from 'rxjs/operators'


@Component({
  selector: 'ngm-today-filter',
  templateUrl: './today-filter.component.html',
  styleUrls: ['./today-filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NxTodayFilterComponent), // replace name as appropriate
      multi: true
    }
  ]
})
export class NxTodayFilterComponent implements OnInit, OnChanges, ControlValueAccessor {
  TimeGranularity = TimeGranularity
  TIME_GRANULARITY_SEQUENCES = TIME_GRANULARITY_SEQUENCES

  @HostBinding('class.ngm-today-filter') _hostClass = true

  private coreService = inject(NxCoreService)
  private dsCoreService = inject(NgmDSCoreService)

  @Input() get granularity() {
    return this._timeGranularity
  }
  set granularity(value) {
    this._timeGranularity = value
    this.dsCoreService.setTimeGranularity(value)
  }
  private _timeGranularity = TimeGranularity.Month
  @Input() granularitySequence = 0
  @Input() defaultValue: string
  @Input() appearance: NgmAppearance
  @Input() displayDensity: DisplayDensity

  date = new FormControl(new Date())
  /**
   * Invoked when the model has been changed
   */
  onChange: (_: any) => void = (_: any) => {}
  /**
   * Invoked when the model has been touched
   */
  onTouched: () => void = () => {}

  ngOnChanges({ defaultValue }: SimpleChanges): void {
    if (defaultValue && defaultValue.currentValue) {
      let value = this.coreService.execDateVariables(defaultValue.currentValue)
      value = Array.isArray(value) ? value[0] : value
      this.date.setValue(value)
      this.dsCoreService.setToday(value)
      this.onChange(value)
    }
  }

  ngOnInit(): void {
    this.date.valueChanges.pipe(filter((value) => value !== null)).subscribe((value) => {
      this.dsCoreService.setToday(value)
      this.onChange(value)
    })
  }

  writeValue(obj: any): void {
    if (isDate(obj)) {
      this.date.setValue(obj)
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {}
}

@Component({
  selector: 'ngm-quarter-filter',
  template: `<mat-form-field [appearance]="appearance?.appearance" [displayDensity]="appearance?.displayDensity">
    <mat-label>{{ 'COMPONENTS.TIME_FILTER.TODAY' | translate: {Default: 'Today'} }}</mat-label>
    <input matInput [matDatepicker]="dp" [formControl]="date" />
    <mat-datepicker
      #dp
      startView="multi-year"
      (yearSelected)="chosenYearHandler($event)"
      (monthSelected)="chosenMonthHandler($event, dp)"
    ></mat-datepicker>

    <div matSuffix class="flex items-center">
      <mat-datepicker-toggle [for]="dp"></mat-datepicker-toggle>
      <ng-content></ng-content>
    </div>
  </mat-form-field> `,
  styleUrls: ['./today-filter.component.scss'],
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: `yyyy'Q'Q`
        },
        display: {
          dateInput: `yyyy'Q'Q`,
          monthYearLabel: 'LLL y',
          dateA11yLabel: 'MMMM d, y',
          monthYearA11yLabel: 'MMMM y'
        }
      }
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NxQuarterFilterComponent), // replace name as appropriate
      multi: true
    }
  ]
})
export class NxQuarterFilterComponent implements ControlValueAccessor {
  @Input() appearance: NgmAppearance

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
    // throw new Error('Method not implemented.')
  }
}

@Component({
  selector: 'ngm-month-filter',
  template: `<input matInput [matDatepicker]="dp" [formControl]="date" />
<mat-datepicker
  #dp
  startView="multi-year"
  (yearSelected)="chosenYearHandler($event)"
  (monthSelected)="chosenMonthHandler($event, dp)"
></mat-datepicker>

<div matSuffix class="abs flex items-center">
  <mat-datepicker-toggle [for]="dp"></mat-datepicker-toggle>
  <ng-content></ng-content>
</div>
`,
  styleUrls: ['./today-filter.component.scss'],
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
      useExisting: forwardRef(() => NxMonthFilterComponent), // replace name as appropriate
      multi: true
    }
  ]
})
export class NxMonthFilterComponent implements ControlValueAccessor {
  @Input() appearance: NgmAppearance

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
    // throw new Error('Method not implemented.')
  }
}

@Component({
  selector: 'ngm-year-filter',
  template: `<mat-form-field [appearance]="appearance?.appearance" [displayDensity]="appearance?.displayDensity">
    <mat-label>{{ 'COMPONENTS.TIME_FILTER.TODAY' | translate: {Default: 'Today'} }}</mat-label>
    <input matInput [matDatepicker]="dp" [formControl]="date" />
    <mat-datepicker
      #dp
      startView="multi-year"
      (yearSelected)="chosenYearHandler($event, dp)"
    ></mat-datepicker>

    <div matSuffix class="flex items-center">
      <mat-datepicker-toggle [for]="dp"></mat-datepicker-toggle>
      <ng-content></ng-content>
    </div>
  </mat-form-field>`,
  styleUrls: ['./today-filter.component.scss'],
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: `yyyy`
        },
        display: {
          dateInput: `yyyy`,
          monthYearLabel: 'LLL y',
          dateA11yLabel: 'MMMM d, y',
          monthYearA11yLabel: 'MMMM y'
        }
      }
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NxYearFilterComponent), // replace name as appropriate
      multi: true
    }
  ]
})
export class NxYearFilterComponent implements ControlValueAccessor {
  @Input() appearance: NgmAppearance

  date = new FormControl(new Date())

  /**
   * Invoked when the model has been changed
   */
  onChange: (_: any) => void = (_: any) => {}
  /**
   * Invoked when the model has been touched
   */
  onTouched: () => void = () => {}

  chosenYearHandler(event, datepicker: MatDatepicker<any>) {
    const ctrlValue = this.date.value ?? new Date()
    this.date.setValue(setYear(ctrlValue, getYear(event)))
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
    // throw new Error('Method not implemented.')
  }
}
