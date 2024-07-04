import { CommonModule } from '@angular/common'
import { Component, forwardRef, Input } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { PropertyDimension } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { distinctUntilChanged } from 'rxjs'
import { NgmDisplayBehaviourComponent } from '../display-behaviour'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    TranslateModule,
    NgmDisplayBehaviourComponent
  ],
  selector: 'ngm-hierarchy-select',
  templateUrl: './hierarchy-select.component.html',
  styles: [],
  host: {
    class: 'ngm-hierarchy-select'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmHierarchySelectComponent)
    }
  ]
})
export class NgmHierarchySelectComponent implements ControlValueAccessor {
  @Input() label: string
  @Input() appearance: MatFormFieldAppearance
  @Input() dimensions: PropertyDimension[]

  formControl = new FormControl<string>(null)
  onChange: (input: any) => void
  onTouched: () => void

  // Subscribers
  private _formValueSub = this.formControl.valueChanges
    .pipe(distinctUntilChanged(), takeUntilDestroyed())
    .subscribe((value) => {
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
    isDisabled ? this.formControl.disable() : this.formControl.enable()
  }
}
