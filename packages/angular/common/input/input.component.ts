import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  forwardRef
} from '@angular/core'
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatInputModule } from '@angular/material/input'
import { ISelectOption } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { BehaviorSubject, map, startWith, switchMap } from 'rxjs'
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
export class NgmInputComponent implements ControlValueAccessor, OnInit {
  @Input() label: string
  @Input() placeholder: string
  @Input() type: string
  @Input() defaultValue = null
  @Input() valueKey = 'value'
  @Input() options: ISelectOption[]

  @Input() disabled = false

  @Output() blur = new EventEmitter()

  /**
   * Template provided in the tab content that will be used if present, used to enable lazy-loading
   */
  @ContentChild(NgmOptionContent, { read: TemplateRef, static: true })
  // We need an initializer here to avoid a TS error. The value will be set in `ngAfterViewInit`.
  _explicitContent: TemplateRef<any> = undefined!

  value: string
  searchControl = new FormControl()
  private _onChange: (value) => void
  private _onTouched: (value) => void

  private readonly _selectOptions$ = new BehaviorSubject<Array<any>>([])

  readonly options$ = this._selectOptions$.pipe(
    switchMap((options) =>
      this.searchControl.valueChanges.pipe(
        startWith(''),
        map((text) => {
          text = text?.trim().toLowerCase()
          if (text) {
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

  ngOnInit(): void {
    if (this.options) {
      this._selectOptions$.next(this.options)
    }
  }

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
    this.disabled = isDisabled
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
