import { Component, EventEmitter, forwardRef, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { MatDatepicker } from '@angular/material/datepicker'
import { MatFormFieldAppearance } from '@angular/material/form-field'
import { NgmSmartFilterService } from '@metad/ocap-angular/controls'
import { DisplayDensity } from '@metad/ocap-angular/core'
import {
  DataSettings,
  Dimension,
  FilterOperator,
  FilterSelectionType,
  getEntityCalendarHierarchy,
  IFilter,
  ISlicer,
  TimeGranularity,
  TimeRangeType,
  calcRange,
  mapTimeGranularitySemantic,
} from '@metad/ocap-core'
import {
  NxCoreService,
  TIME_GRANULARITY_SEQUENCES
} from '@metad/core'
import { getMonth, getYear, setMonth, setYear } from 'date-fns'
import { isEqual } from 'lodash-es'
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  filter,
  firstValueFrom,
  startWith,
  switchMap,
} from 'rxjs'


@Component({
  selector: 'ngm-member-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  host: {
    class: 'ngm-member-datepicker'
  },
  providers: [
    NgmSmartFilterService,
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmMemberDatepickerComponent)
    }
  ]
})
export class NgmMemberDatepickerComponent implements OnInit, OnChanges, ControlValueAccessor {
  FilterType = FilterSelectionType
  TimeGranularity = TimeGranularity
  TIME_GRANULARITY_SEQUENCES = TIME_GRANULARITY_SEQUENCES

  private coreService = inject(NxCoreService)
  public dataService = inject(NgmSmartFilterService)

  @Input() label: string
  @Input() placeholder: string
  @Input() appearance: MatFormFieldAppearance
  @Input() displayDensity: DisplayDensity

  @Input() dataSettings: DataSettings

  @Input() get dimension() {
    return this._dimension$.value
  }
  set dimension(value) {
    this._dimension$.next(value)
  }
  private _dimension$ = new BehaviorSubject<Dimension>(null)

  private _date: Date[]
  @Input() set date(dat: Date[]) {
    this._date = dat
    this.dateControl.setValue(this._date[1] ?? this._date[0])
    this.fromDateControl.setValue(this._date[0])
  }
  get date(): Date[] {
    return this._date
  }

  @Input() get granularity() {
    return this._timeGranularity.value
  }
  set granularity(value) {
    this._timeGranularity.next(value)
  }
  private _timeGranularity = new BehaviorSubject(TimeGranularity.Month)

  @Input() granularitySequence = 0
  @Input() defaultValue: string
  @Input() selectionType: FilterSelectionType
  @Input() disabled: boolean
  @Input() formatter: string

  @Output() dateChange = new EventEmitter<Date[]>()
  @Output() inputChange = new EventEmitter<IFilter>()

  private entityType$ = this.dataService.selectEntityType()

  dateControl = new FormControl()
  fromDateControl = new FormControl()

  date1: Date
  date2: Date

  propertyHierarchy: Dimension
  private _onChange: (value: any) => void

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private svSubscriber = this.dateControl.valueChanges.pipe(
    startWith(null),
    filter(() => this.selectionType !== FilterSelectionType.SingleRange),
    switchMap(async (value) => {
      const entityType = await firstValueFrom(this.entityType$)
      const dimension = await firstValueFrom(this._dimension$)
      const timeGranularity = this.granularity
      if (!(entityType && dimension && timeGranularity)) {
        return null
      }
      
      let slicer: ISlicer
      const calendar = getEntityCalendarHierarchy(entityType, dimension)
      if (calendar) {
        const calendarSemantic = mapTimeGranularitySemantic(timeGranularity)
        const calendarLevel = calendar.levels?.find((level) => level.semantics?.semantic === calendarSemantic)

        const results = calcRange(value || new Date(), {
          type: TimeRangeType.Standard,
          granularity: timeGranularity,
          formatter: this.formatter || calendarLevel?.semantics?.formatter
        })

        slicer = {
          dimension,
          members: [
            {
              key: results[0],
              value: results[0],
            }
          ]
        }
      }

      return slicer
    }),
    catchError((err) => {
      console.error(err)
      return EMPTY
    }),
    distinctUntilChanged(isEqual)
  )
  .subscribe((slicer) => {
    this._onChange?.(slicer)
    this.dateChange.emit([this.dateControl.value])
  })

  private srSubscriber = combineLatest([this.fromDateControl.valueChanges, this.dateControl.valueChanges])
    .pipe(
      startWith([this.fromDateControl.value, this.dateControl.value]),
      filter(() => this.selectionType === FilterSelectionType.SingleRange),
      switchMap(async ([from, to]) => {
        const entityType = await firstValueFrom(this.entityType$)
        const dimension = await firstValueFrom(this._dimension$)
        const timeGranularity = this.granularity
        if (!(entityType && dimension && timeGranularity)) {
          return null
        }

        let slicer: ISlicer
        const calendar = getEntityCalendarHierarchy(entityType, dimension)
        if (calendar) {
          const calendarSemantic = mapTimeGranularitySemantic(timeGranularity)
          const calendarLevel = calendar.levels?.find((level) => level.semantics?.semantic === calendarSemantic)

          slicer = <IFilter>{
            dimension,
            members: [
              {
                value: calcRange(from || new Date(), {
                  type: TimeRangeType.Standard,
                  granularity: timeGranularity,
                  formatter: this.formatter || calendarLevel?.semantics?.formatter
                })[0]
              },
              {
                value: calcRange(to || new Date(), {
                  type: TimeRangeType.Standard,
                  granularity: timeGranularity,
                  formatter: this.formatter || calendarLevel?.semantics?.formatter
                })[0]
              }
            ],
            operator: FilterOperator.BT
          }
        }

        return slicer
      }),
      distinctUntilChanged(isEqual)
    )
    .subscribe((slicer) => {
      this._onChange?.(slicer)
      this.dateChange.emit([this.fromDateControl.value, this.dateControl.value])
    })

  ngOnInit() {
    if (this.disabled) {
      this.dateControl.disable()
    }
  }

  ngOnChanges({ dataSettings, dimension, defaultValue }: SimpleChanges): void {
    if (defaultValue?.currentValue) {
      const value = this.coreService.execDateVariables(defaultValue.currentValue)
      this.date = Array.isArray(value) ? value : [value]
    }

    if (dataSettings?.currentValue) {
      this.dataService.dataSettings = dataSettings.currentValue
    }
    if (dimension?.currentValue) {
      this.dataService.options = {
        ...this.dataService.options,
        dimension: dimension.currentValue
      }
    }
  }

  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
    isDisabled ? this.dateControl.disable() : this.dateControl.enable()
    isDisabled ? this.fromDateControl.disable() : this.fromDateControl.enable()
  }

  dateRangeChanged(event) {
    this.dateChange.emit(event)
    if (event.end) {
      const filter = event
        ? {
            dimension: this.propertyHierarchy,
            members: [event.start, event.end],
            operator: FilterOperator.BT
          }
        : null

      this._onChange?.(filter)
    }
  }

  dateChanged(event) {
    this.dateChange.emit(event)

    const filter = event
      ? {
          dimension: this.propertyHierarchy,
          members: event
        }
      : null

    this._onChange?.(filter)
  }

  date1Changed(event) {
    this.date1 = event
    this.onDateRangeChange()
  }
  date2Changed(event) {
    this.date2 = event
    this.onDateRangeChange()
  }

  onDateRangeChange() {
    if (this.date1 && this.date2) {
      const ftr = {
        dimension: this.propertyHierarchy,
        members: [this.date1, this.date2],
        operator: FilterOperator.BT
      }
    }
  }

  onChange(event) {
    if (!event) {
      this.dateChanged(null)
    } else {
      //
    }
  }
}

@Component({
  selector: 'ngm-quarter-filter',
  template: `<mat-form-field class="flex-1" [appearance]="appearance">
    <mat-label>{{ label }}</mat-label>
    <input matInput [matDatepicker]="dp" [formControl]="date" [placeholder]="placeholder" />
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
  </mat-form-field>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NxQuarterFilterComponent), // replace name as appropriate
      multi: true
    }
  ]
})
export class NxQuarterFilterComponent implements ControlValueAccessor {
  @Input() appearance: MatFormFieldAppearance
  @Input() label: string
  @Input() placeholder: string

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
    const ctrlValue = this.date.value
    this.date.setValue(setYear(ctrlValue, getYear(event)))
  }

  chosenMonthHandler(event, datepicker: MatDatepicker<any>) {
    const ctrlValue = this.date.value
    this.date.setValue(setMonth(ctrlValue, getMonth(event)))
    datepicker.close()
    this.onChange(this.date.value)
  }

  writeValue(obj: any): void {
    if (obj) {
      this.date.setValue(obj)
    }
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

@Component({
  selector: 'ngm-month-filter',
  template: ` <mat-form-field class="flex-1" [appearance]="appearance">
    <mat-label>{{ label }}</mat-label>
    <input matInput [matDatepicker]="dp" [formControl]="date" [placeholder]="placeholder"/>
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
  </mat-form-field>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NxMonthFilterComponent), // replace name as appropriate
      multi: true
    }
  ]
})
export class NxMonthFilterComponent implements ControlValueAccessor {
  @Input() appearance: MatFormFieldAppearance
  @Input() label: string
  @Input() placeholder: string

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
    const ctrlValue = this.date.value
    this.date.setValue(setYear(ctrlValue, getYear(event)))
  }

  chosenMonthHandler(event, datepicker: MatDatepicker<any>) {
    const ctrlValue = this.date.value
    this.date.setValue(setMonth(ctrlValue, getMonth(event)))
    datepicker.close()
    this.onChange(this.date.value)
  }

  writeValue(obj: any): void {
    if (obj) {
      this.date.setValue(obj)
    }
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

@Component({
  selector: 'ngm-year-filter',
  template: `<mat-form-field class="flex-1" [appearance]="appearance">
    <mat-label>{{ label }}</mat-label>
    <input matInput [matDatepicker]="dp" [formControl]="date" [placeholder]="placeholder"/>
    <mat-datepicker #dp startView="multi-year" (yearSelected)="chosenYearHandler($event, dp)"></mat-datepicker>

    <div matSuffix class="flex items-center">
      <mat-datepicker-toggle [for]="dp"></mat-datepicker-toggle>
      <ng-content></ng-content>
    </div>
  </mat-form-field>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NxYearFilterComponent), // replace name as appropriate
      multi: true
    }
  ]
})
export class NxYearFilterComponent implements ControlValueAccessor {
  @Input() appearance: MatFormFieldAppearance
  @Input() label: string
  @Input() placeholder: string

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
    // const ctrlValue = this.date.value
    this.date.setValue(event) // setYear(ctrlValue, getYear(event)))
    datepicker.close()
    this.onChange(this.date.value)
  }

  writeValue(obj: any): void {
    if (obj) {
      this.date.setValue(obj)
    }
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
