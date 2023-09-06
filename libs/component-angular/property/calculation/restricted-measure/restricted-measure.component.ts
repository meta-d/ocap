import { CommonModule } from '@angular/common'
import { Component, forwardRef, Input, OnInit } from '@angular/core'
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup
} from '@angular/forms'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTooltipModule } from '@angular/material/tooltip'
import { NgmSelectModule } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import {
  DataSettings,
  DisplayBehaviour,
  EntityType,
  getEntityMeasures,
  isIndicatorMeasureProperty,
  negate
} from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { NxCoreService } from '@metad/core'
import { sortBy } from 'lodash-es'
import { BehaviorSubject, map } from 'rxjs'
import { PropertyArrayComponent } from '../../property-array/property-array.component'
import { PropertyCapacity } from '../../property-select/property-select.component'
import { NgmMeasureSelectComponent } from '../../measure-select/measure-select.component'

@Component({
  standalone: true,
  selector: 'nx-restricted-measure',
  templateUrl: './restricted-measure.component.html',
  styleUrls: ['./restricted-measure.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => RestrictedMeasureComponent)
    }
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatSlideToggleModule,
    MatTooltipModule,
    OcapCoreModule,
    NgmSelectModule,
    PropertyArrayComponent,
    NgmMeasureSelectComponent
  ]
})
export class RestrictedMeasureComponent implements OnInit, ControlValueAccessor {
  DISPLAY_BEHAVIOUR = DisplayBehaviour
  PropertyCapacity = PropertyCapacity

  @Input() disabled: boolean
  @Input() dataSettings: DataSettings
  @Input() get entityType(): EntityType {
    return this.entityType$.value
  }
  set entityType(value) {
    this.entityType$.next(value)
  }
  public readonly entityType$ = new BehaviorSubject<EntityType>(null)
  @Input() coreService: NxCoreService

  formGroup: UntypedFormGroup

  get measure() {
    return this.formGroup.get('measure') as UntypedFormControl
  }

  // 排除指标度量后的度量列表
  public readonly measures$ = this.entityType$.pipe(
    map(getEntityMeasures),
    map((measures) => measures.filter((property) => negate(isIndicatorMeasureProperty)(property))),
    map((measures) => sortBy(measures, 'calculationType').reverse())
  )

  private _onChange: any
  constructor(private formBuilder: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      measure: null,
      dimensions: null,
      enableConstantSelection: null
    })

    this.formGroup.valueChanges.subscribe((value) => {
      this._onChange?.(value)
    })
  }

  writeValue(obj: any): void {
    if (obj) {
      this.formGroup.patchValue(obj)
    }
  }
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }
}
