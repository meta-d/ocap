import { CommonModule } from '@angular/common'
import { Component, forwardRef, inject } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { ControlValueAccessor, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { cloneDeep } from '@metad/ocap-core'
import { FormlyModule } from '@ngx-formly/core'
import { DesignerSchema, STORY_DESIGNER_SCHEMA } from '../types'

@Component({
  standalone: true,
  selector: 'ngm-designer-form',
  templateUrl: 'designer-form.component.html',
  styleUrls: ['designer-form.component.scss'],
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

  private valueSub = this.formGroup.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
    this.schema.model = value
    this.onChange?.(value)
  })

  onChange: (input: any) => void
  onTouched: () => void

  writeValue(obj: any): void {
    if (obj) {
      this.formGroup.patchValue(obj)
      this.model = cloneDeep(obj)
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
    // console.log(event)
  }
}
