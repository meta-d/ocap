import { Component, forwardRef, inject, Input } from '@angular/core'
import { ControlValueAccessor, FormBuilder, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { CompareToEnum, DataSettings, EntityType } from '@metad/ocap-core'
import { PropertyCapacity } from '../types'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { NgmPropertySelectComponent } from '../property-select/property-select.component'
import { NgmCompareMemberSelectComponent } from '../compare-member-select/member-select.component'
import { MatCheckboxModule } from '@angular/material/checkbox'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,

    NgmPropertySelectComponent,
    NgmCompareMemberSelectComponent
  ],
  selector: 'ngm-calculation-variance',
  templateUrl: 'variance.component.html',
  styleUrls: ['variance.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmCalculationVarianceComponent)
    }
  ]
})
export class NgmCalculationVarianceComponent implements ControlValueAccessor {
  PropertyCapacity = PropertyCapacity
  COMPARE_TO_ENUM = CompareToEnum

  private formBuilder = inject(FormBuilder)

  @Input() dsCoreService: NgmDSCoreService
  @Input() dataSettings: DataSettings
  @Input() entityType: EntityType

  formGroup: FormGroup = this.formBuilder.group({
    measure: [null, Validators.required],
    baseDimension: [null, Validators.required],
    compareA: null,
    toB: null,
    asZero: null,
    asPercentage: null,
    directDivide: null,
    absBaseValue: null,
    divideBy: null
  })

  get asPercentage() {
    return this.formGroup.value.asPercentage
  }
  get directDivide() {
    return this.formGroup.value.directDivide
  }
  get baseDimension() {
    return this.formGroup.value.baseDimension
  }
  get divideBy() {
    return this.formGroup.value.divideBy
  }
  get absBaseValue() {
    return this.formGroup.value.absBaseValue
  }

  get expression() {
    if (this.asPercentage) {
      let divideBy = this.divideBy || 'B'
      if (this.absBaseValue) {
        divideBy = `abs(${divideBy})`
      }
      if (this.directDivide) {
        return `A / ${divideBy}`
      }
      return `(A - B) / ${divideBy}`
    }

    return `(A - B)`
  }

  private _onChange: any

  private valueSub = this.formGroup.valueChanges.subscribe((value) => {
    this._onChange?.(value)
  })

  writeValue(obj: any): void {
    this.formGroup.patchValue(obj || {})
  }
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}
}
