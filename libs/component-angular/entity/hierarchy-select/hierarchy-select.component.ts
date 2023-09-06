import { CommonModule } from '@angular/common'
import { Component, ElementRef, forwardRef, Input } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { CanDisable, mixinColor, mixinDisabled, mixinDisableRipple } from '@angular/material/core'
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { NgmDisplayBehaviourComponent } from '@metad/ocap-angular/common'
import { PropertyDimension } from '@metad/ocap-core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { distinctUntilChanged } from 'rxjs'


@UntilDestroy({checkProperties: true})
@Component({
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule, NgmDisplayBehaviourComponent],
  selector: 'ngm-hierarchy-select',
  template: `<mat-form-field [appearance]="appearance" class="w-full">
  <mat-label>{{label}}</mat-label>
  <mat-select [formControl]="formControl">
    <mat-option>-- None --</mat-option>
    <mat-optgroup *ngFor="let dimension of dimensions" [label]="dimension.caption">
        <mat-option *ngFor="let hierarchy of dimension.hierarchies" [value]="hierarchy.name">
            <ngm-display-behaviour class="flex-1" [option]="{value: hierarchy.name, label: hierarchy.caption}"></ngm-display-behaviour>
        </mat-option>
    </mat-optgroup>
  </mat-select>
</mat-form-field>`,
  styles: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmHierarchySelectComponent)
    }
  ]
})
export class NgmHierarchySelectComponent
  extends mixinColor(
    mixinDisabled(
      mixinDisableRipple(
        class {
          constructor(public _elementRef: ElementRef) {}
        }
      )
    )
  )
  implements ControlValueAccessor, CanDisable
{

  @Input() label: string
  @Input() appearance: MatFormFieldAppearance
  @Input() dimensions: PropertyDimension[]

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
