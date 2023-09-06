import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { SelectionModel } from '@angular/cdk/collections'
import { ScrollingModule } from '@angular/cdk/scrolling'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core'
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidatorFn
} from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox'
import {
  CanColor,
  CanDisable,
  CanDisableRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple
} from '@angular/material/core'
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { DisplayDensity, ISelectOption, OcapCoreModule } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { BehaviorSubject } from 'rxjs'
import { combineLatestWith, debounceTime, distinctUntilChanged, filter, map, startWith } from 'rxjs/operators'
import { NgmDisplayBehaviourComponent } from '../../display-behaviour'

@UntilDestroy()
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-mat-select',
  templateUrl: 'select.component.html',
  styleUrls: ['select.component.scss'],
  inputs: ['disabled', 'disableRipple', 'color'],
  host: {
    '[attr.disabled]': 'disabled || null'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmMatSelectComponent)
    }
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    ScrollingModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    NgmDisplayBehaviourComponent,
    OcapCoreModule
  ]
})
export class NgmMatSelectComponent
  extends mixinColor(
    mixinDisabled(
      mixinDisableRipple(
        class {
          constructor(public _elementRef: ElementRef) {}
        }
      )
    )
  )
  implements CanDisable, CanColor, CanDisableRipple, OnInit, OnChanges, ControlValueAccessor
{
  @HostBinding('class.ngm-mat-select') _isSelectComponent = true

  @Input() appearance: MatFormFieldAppearance
  @Input() displayBehaviour: DisplayBehaviour | string
  @Input() displayDensity: DisplayDensity | string
  @Input() label: string
  @Input() placeholder: string

  @Input() validators: ValidatorFn | ValidatorFn[] | null

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

  virtualScrollItemSize = 48

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
  onTouched: () => void

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
      this._updateLabel()
      this.onChange?.(this.selection.selected)
    })

    this._selectOptions$.subscribe(() => {
      this._updateLabel()
    })
  }

  ngOnChanges({ displayDensity, validators }: SimpleChanges): void {
    if (displayDensity) {
      if (this.displayDensity === DisplayDensity.compact) {
        this.virtualScrollItemSize = 30
      } else if (this.displayDensity === DisplayDensity.cosy) {
        this.virtualScrollItemSize = 36
      } else {
        this.virtualScrollItemSize = 48
      }
    }

    if (validators) {
      this.formControl.setValidators(validators.currentValue)
    }
  }

  writeValue(obj: any): void {
    if (obj) {
      if (this.multiple) {
        this.selection.select(...obj)
      } else {
        this.formControl.setValue({ value: obj }, { emitEvent: false })
      }
      this._updateLabel()
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any) {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
    isDisabled ? this.formControl.disable() : this.formControl.enable()
  }

  trackBy(i: number, item: ISelectOption) {
    return item.value
  }

  displayWith(value: any) {
    return Array.isArray(value) ? value : value?.label || value?.value
  }

  private _updateLabel() {
    if (this.multiple) {
      this.formControl.setValue(
        this.selection.selected.map((value) => this.selectOptions?.find((item) => item.value === value)?.label || value)
      )
    } else {
      let option: any = this.formControl.value
      // if (isObject(option)) {
      const value = option.value
      if (value && !option.label) {
        option = {
          value,
          label: this.selectOptions?.find((item) => item.value === value)?.label
        }
        this.formControl.setValue(option, { emitEvent: false })
      }
      // }
    }
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

  getErrorMessage() {
    return Object.values(this.formControl.errors).join(', ')
  }
}
