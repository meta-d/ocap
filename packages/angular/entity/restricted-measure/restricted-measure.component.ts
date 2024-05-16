import { CommonModule } from '@angular/common'
import { Component, forwardRef, Input, OnInit } from '@angular/core'
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTooltipModule } from '@angular/material/tooltip'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import {
  DataSettings,
  DisplayBehaviour,
  EntityType,
  getEntityMeasures,
  isIndicatorMeasureProperty,
  negate,
  PropertyMeasure
} from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { sortBy } from 'lodash-es'
import { BehaviorSubject, map } from 'rxjs'
import { PropertyCapacity } from '../types'
import { NgmMeasureSelectComponent } from '../measure-select/measure-select.component'
import { NgmPropertyArrayComponent } from '../property-array/property-array.component'

@Component({
  standalone: true,
  selector: 'ngm-restricted-measure',
  templateUrl: './restricted-measure.component.html',
  styleUrls: ['./restricted-measure.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmRestrictedMeasureComponent)
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
    NgmMeasureSelectComponent,
    NgmPropertyArrayComponent
  ]
})
export class NgmRestrictedMeasureComponent implements OnInit, ControlValueAccessor {
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
  // @Input() coreService: NxCoreService

  formGroup: FormGroup

  get measure() {
    return this.formGroup.get('measure') as FormControl
  }

  // 排除指标度量后的度量列表
  public readonly measures$ = this.entityType$.pipe(
    map(getEntityMeasures),
    map((measures) => measures.filter((property) => negate(isIndicatorMeasureProperty)(property))),
    map((measures) => sortBy(measures, 'calculationType').reverse())
  )

  filterMeasure: (measure: PropertyMeasure) => boolean = (measure) => measure.name !== this.formGroup?.value?.name

  private _onChange: any

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      name: null,
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
