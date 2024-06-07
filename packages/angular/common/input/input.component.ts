import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  forwardRef,
  input,
  signal
} from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatInputModule } from '@angular/material/input'
import { ISelectOption } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { map, startWith, switchMap } from 'rxjs'
import { NgmOptionContent } from './option-content'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, MatInputModule, MatAutocompleteModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmInputComponent)
    }
  ]
})
export class NgmInputComponent implements ControlValueAccessor {
  @Input() label: string
  @Input() placeholder: string
  readonly type = input<string>(null)
  @Input() defaultValue = null
  @Input() valueKey = 'value'

  readonly options = input<ISelectOption[]>()

  readonly disabled = input(false)
  readonly _disabled = signal(false)

  @Output() blur = new EventEmitter()

  /**
   * Template provided in the tab content that will be used if present, used to enable lazy-loading
   */
  @ContentChild(NgmOptionContent, { read: TemplateRef, static: true })
  // We need an initializer here to avoid a TS error. The value will be set in `ngAfterViewInit`.
  _explicitContent: TemplateRef<any> = undefined!

  get value() {
    return this._value()
  }
  set value(value) {
    this._value.set(value)
  }
  private readonly _value = signal(null)

  searchControl = new FormControl()
  private _onChange: (value) => void
  private _onTouched: (value) => void

  readonly options$ = toObservable(this.options).pipe(
    switchMap((options) =>
      this.searchControl.valueChanges.pipe(
        startWith(''),
        map((text) => {
          text = typeof text === 'string' ? text?.trim().toLowerCase() : text
          if (text && options) {
            const terms = text.split(' ').filter((t) => !!t)
            return options.filter((option) => {
              const str = `${option.caption || option.label || ''}${option[this.valueKey]}`
              return terms.every((term) => str?.toLowerCase().includes(term))
            })
          }
          return options
        })
      )
    )
  )

  writeValue(obj: any): void {
    this.value = obj ?? this.defaultValue
  }
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    this._disabled.set(isDisabled)
  }

  onChange(event) {
    this.searchControl.setValue(event)
    this.value = event
    this._onChange(this.value)
  }

  onOptionSelected(event) {
    this.searchControl.setValue(null)
  }
}
