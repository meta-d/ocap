import { SelectionModel } from '@angular/cdk/collections'
import { ScrollingModule } from '@angular/cdk/scrolling'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
  TemplateRef,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  input,
  signal
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidatorFn
} from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { DisplayDensity, ISelectOption, OcapCoreModule } from '@metad/ocap-angular/core'
import { DisplayBehaviour, isNil, nonNullable } from '@metad/ocap-core'
import { distinctUntilChanged, filter } from 'rxjs/operators'
import { NgmDisplayBehaviourComponent } from '../../display-behaviour'
import { NgmOptionContent } from '../../input/option-content'

@Component({
  standalone: true,
  selector: 'ngm-select',
  templateUrl: `select.component.html`,
  styleUrls: [`select.component.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngm-select'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmSelectComponent)
    }
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
    ScrollingModule,

    OcapCoreModule,
    NgmDisplayBehaviourComponent,
    NgmOptionContent
  ]
})
export class NgmSelectComponent implements ControlValueAccessor
{
  readonly displayBehaviour = input<DisplayBehaviour | string>()
  readonly displayDensity = input<DisplayDensity | string>()
  /**
   * The name of key field of option 
  */
 readonly valueKey = input<'value' | 'key' | string>('value')
 readonly label = input<string>()
 readonly placeholder = input<string>()

  readonly searchable = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })
  readonly virtualScroll = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  readonly validators = input<ValidatorFn | ValidatorFn[] | null>()

  readonly multiple = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  readonly selectOptions = input<Array<ISelectOption>>()
  readonly panelWidth = input<string | number | null>(null)
  readonly allowInput = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  @ContentChild(NgmOptionContent, { read: TemplateRef, static: true })
  _explicitContent: TemplateRef<any> = undefined!

  formControl = new FormControl<string>(null)
  readonly value = signal<string | number>(null)

  selection = new SelectionModel<string>(true)
  searchControl = new FormControl<string>(null)
  readonly highlight = toSignal(this.searchControl.valueChanges, { initialValue: '' })

  readonly options$ = computed(() => {
    const text = this.highlight()?.trim().toLowerCase()
    if (text) {
      const terms = text.split(' ').filter((t) => !!t)
      return this.selectOptions()?.filter((option) => {
        const str = `${option.caption || option.label || ''}${option[this.valueKey()]}`
        return terms.every((term) => str?.toLowerCase().includes(term))
      })
    }
    return this.selectOptions()
  })

  public selectTrigger = computed(() => {
    return this.selectOptions()?.find((option) => option[this.valueKey()] === this.value())
  })

  readonly autoInput = signal(null)

  onChange: (input: any) => void
  onTouched: () => void

  private valueSub = this.formControl.valueChanges
    .pipe(
      filter(() => !this.multiple()),
      distinctUntilChanged(),
      takeUntilDestroyed()
    )
    .subscribe((value) => {
      this.value.set(value)
      this.onChange?.(value)
    })

  private selectionSub = this.selection.changed
    .pipe(
      filter(() => this.multiple()),
      takeUntilDestroyed()
    )
    .subscribe(() => {
      this.onChange?.(this.selection.selected)
    })

  constructor() {
    effect(() => {
      if (!isNil(this.value())) {
        const selectedOption = this.selectOptions()?.find((item) => item[this.valueKey()] === this.value())
        if (nonNullable(selectedOption?.[this.valueKey()])) {
          this.autoInput.set(selectedOption)
        } else {
          this.autoInput.set(null)
        }
      } else {
        this.autoInput.set(null)
      }
    }, { allowSignalWrites: true })
  }

  writeValue(obj: any): void {
    this.formControl.setValue(obj, {emitEvent: false})
    this.value.set(obj)
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any) {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.formControl.disable() : this.formControl.enable()
  }
  trackByValue(index: number, item) {
    return item?.key
  }

  displayWith(option: any) {
    return option?.caption || option?.label || option?.key
  }

  onAutoInput(event: any) {
    if (typeof event === 'string') {
      this.searchControl.setValue(event)
    } else {
      this.formControl.setValue(event?.[this.valueKey()])
      this.searchControl.setValue(null)
    }
  }

  onOptionSelected(event: any) {
    //
  }

  onBlur(event: FocusEvent) {
    if (!this.allowInput()) {
      return
    }
    const value = (<HTMLInputElement>event.target).value.trim()
    if (!this.formControl.value && value) {
      this.formControl.setValue(value)
      this.searchControl.setValue(null)
    }
  }
}
