import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, ElementRef, Input, forwardRef } from '@angular/core'
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { CanColor, CanDisable, mixinColor, mixinDisabled } from '@angular/material/core'
import { MatInputModule } from '@angular/material/input'
import { DensityDirective } from '@metad/ocap-angular/core'
import { ColorFormat, MtxColorpickerModule } from '@ng-matero/extensions/colorpicker'
import { TranslateModule } from '@ngx-translate/core'


@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, MatInputModule, MtxColorpickerModule, DensityDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-color-input',
  templateUrl: './color-input.component.html',
  styleUrls: ['./color-input.component.scss'],
  inputs: ['disabled', 'color'],
  host: {
    'class': 'ngm-color-input',
    '[attr.disabled]': 'disabled || null'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmColorInputComponent)
    }
  ]
})
export class NgmColorInputComponent extends mixinColor(
  mixinDisabled(
    class {
      constructor(public _elementRef: ElementRef) {}
    }
  )
) implements CanDisable, CanColor, ControlValueAccessor {
  @Input() label: string
  @Input() default = '#00000000'
  @Input() format: ColorFormat

  value: string

  get hasColor() {
    return !!this.value
  }

  private _onChange: (value) => void
  private _onTouched: (value) => void

  writeValue(obj: any): void {
    this.value = obj
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

  changeColor(value: string) {
    this._onChange?.(value)
  }

  toggleColor(event: boolean) {
    if (event) {
      this.value = this.value ?? this.default
    } else {
      this.value = null
    }
    this.changeColor(this.value)
  }
}
