import { animate, style, transition, trigger } from '@angular/animations'
import { CommonModule } from '@angular/common'
import { Component, forwardRef, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ControlValueAccessor, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { FormlyModule } from '@ngx-formly/core'
import { DesignerSchema, STORY_DESIGNER_SCHEMA } from '../types'

@Component({
  standalone: true,
  selector: 'ngm-designer-form',
  templateUrl: 'designer-form.component.html',
  styleUrls: ['designer-form.component.scss'],
  animations: [
    trigger('settingsComponent', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate(300, style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [animate(200, style({ 'transform-origin': 'center', transform: 'scale(0.5)' }))])
    ])
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FormlyModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmDesignerFormComponent)
    }
  ]
})
export class NgmDesignerFormComponent implements ControlValueAccessor {
  private schema: DesignerSchema = inject(STORY_DESIGNER_SCHEMA)

  formGroup = new FormGroup({})
  model = {}
  options = {}

  public readonly fields = toSignal(this.schema.getSchema())

  onChange: (input: any) => void
  onTouched: () => void

  writeValue(obj: any): void {
    if (obj) {
      console.log('writeValue', obj)
      this.formGroup.patchValue(obj)
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.formGroup.disable() : this.formGroup.enable()
  }

  onModelChange(event) {
    console.log(event)
  }
}
