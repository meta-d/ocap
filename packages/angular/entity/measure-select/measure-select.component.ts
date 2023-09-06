import { CommonModule } from '@angular/common'
import { Component, computed, ElementRef, forwardRef, Input, signal } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { CanColor, CanDisable, mixinColor, mixinDisabled, mixinDisableRipple } from '@angular/material/core'
import { NgmSelectModule } from '@metad/ocap-angular/common'
import { PropertyMeasure } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { distinctUntilChanged } from 'rxjs'
import { NgmEntityPropertyComponent } from '../property/property.component'

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, NgmSelectModule, NgmEntityPropertyComponent],
  selector: 'ngm-measure-select',
  templateUrl: './measure-select.component.html',
  styles: [],
  inputs: ['color', 'disabled'],
  host: {
    class: 'ngm-measure-select'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmMeasureSelectComponent)
    }
  ]
})
export class NgmMeasureSelectComponent
  extends mixinColor(
    mixinDisabled(
      mixinDisableRipple(
        class {
          constructor(public _elementRef: ElementRef) {}
        }
      )
    )
  )
  implements ControlValueAccessor, CanDisable, CanColor
{
  @Input() label: string
  @Input() placeholder: string
  @Input() get measures(): PropertyMeasure[] {
    return this._measures()
  }
  set measures(value: PropertyMeasure[]) {
    this._measures.set(value)
  }
  private readonly _measures = signal<PropertyMeasure[]>([])

  public readonly measureOptions = computed(() => {
    return this._measures().map((measure) => ({
      key: measure.name,
      caption: measure.caption,
      value: measure
    }))
  })

  formControl = new FormControl<string>(null)
  onChange: (input: any) => void
  onTouched: () => void
  // Subscribers
  private _formValueSub = this.formControl.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
    this.onChange?.(value)
  })
  writeValue(obj: any): void {
    this.formControl.setValue(obj)
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
    isDisabled ? this.formControl.disable() : this.formControl.enable()
  }
}
