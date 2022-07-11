import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { SelectionModel } from '@angular/cdk/collections'
import { Component, forwardRef, HostBinding, Input, OnInit } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { MatCheckboxChange } from '@angular/material/checkbox'
import { MatFormFieldAppearance } from '@angular/material/form-field'
import { DisplayDensity, ISelectOption } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { BehaviorSubject } from 'rxjs'
import { combineLatestWith, debounceTime, distinctUntilChanged, filter, map, startWith } from 'rxjs/operators'

@UntilDestroy()
@Component({
  selector: 'ngm-select',
  templateUrl: 'select.component.html',
  styleUrls: ['select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SelectComponent)
    }
  ]
})
export class SelectComponent implements OnInit, ControlValueAccessor {
  @HostBinding('class.ngm-select') _isSelectComponent = true

  @Input() appearance: MatFormFieldAppearance
  @Input() displayBehaviour: DisplayBehaviour | string
  @Input() displayDensity: DisplayDensity | string
  @Input() label: string
  @Input() placeholder: string

  @Input() get selectOptions(): ISelectOption[] {
    return this._selectOptions$.value
  }
  set selectOptions(value) {
    this._selectOptions$.next(value)
  }
  private _selectOptions$ = new BehaviorSubject<ISelectOption[]>([])

  @Input() get multiple(): boolean {
    return this._multiple
  }
  set multiple(value: boolean | string) {
    this._multiple = coerceBooleanProperty(value)
  }
  private _multiple = false

  @Input() get virtualScroll() {
    return this._virtualScroll
  }
  set virtualScroll(value: boolean | string) {
    this._virtualScroll = coerceBooleanProperty(value)
  }
  private _virtualScroll = false

  @Input() loading = false

  formControl = new FormControl<ISelectOption | string[] | string>(null)
  selection = new SelectionModel<string>(true)
  get highlight() {
    return typeof this.formControl.value === 'string' ? this.formControl.value.trim() : null
  }
  get isNotInitial() {
    return Array.isArray(this.formControl.value) ? this.formControl.value.length : this.formControl.value
  }

  public readonly options$ = this.formControl.valueChanges.pipe(
    startWith(''),
    debounceTime(500),
    combineLatestWith(this._selectOptions$),
    map(([name, options]) => {
      const text = Array.isArray(name) ? null : typeof name === 'string' ? name?.trim().toLowerCase() : null
      return options?.filter((option) =>
        text ? option.label?.toLowerCase().includes(text) || `${option.value}`.toLowerCase().includes(text) : true
      )
    })
  )

  onChange: (input: any) => void

  ngOnInit() {
    this.formControl.valueChanges
      .pipe(
        filter(() => !this.multiple),
        distinctUntilChanged(),
        untilDestroyed(this)
      )
      .subscribe((value) => {
        if (typeof value !== 'string' && !Array.isArray(value)) {
          this.onChange?.(value?.value)
        }
      })

    this.selection.changed.pipe(filter(() => this.multiple)).subscribe(() => {
      this.formControl.setValue(this.selection.selected)
      this.onChange?.(this.selection.selected)
    })
  }

  writeValue(obj: any): void {
    if (obj) {
      if (this.multiple) {
        this.selection.select(...obj)
      } else {
        this.formControl.setValue({ value: obj }, { emitEvent: false })
      }
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    //
  }
  setDisabledState?(isDisabled: boolean): void {
    //
  }

  trackBy(i: number, item: ISelectOption) {
    return item.value
  }

  displayWith(value: any) {
    return Array.isArray(value) ? value : value?.label || value?.value
  }

  isSelect(option: ISelectOption) {
    return this.selection.isSelected(option?.value as string)
  }

  onSelect(event: MatCheckboxChange, option: ISelectOption) {
    if (this.multiple) {
      if (event.checked) {
        this.selection.select(option.value as string)
      } else {
        this.selection.deselect(option.value as string)
      }
    }
  }

  clear() {
    this.formControl.setValue(null)
    this.selection.clear()
  }
}
