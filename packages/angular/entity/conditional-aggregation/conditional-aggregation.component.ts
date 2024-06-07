import { CommonModule } from '@angular/common'
import { Component, computed, forwardRef, inject, Input, OnInit, signal } from '@angular/core'
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { NgmParameterSelectComponent } from '@metad/ocap-angular/parameter'
import {
  AggregationOperation,
  AggregationOperations,
  DataSettings,
  DisplayBehaviour,
  EntityType,
  getEntityMeasures,
  isIndicatorMeasureProperty,
  isNil,
  negate,
  Property,
  PropertyMeasure
} from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { sortBy } from 'lodash-es'
import { PropertyCapacity } from '../types'
import { NgmMeasureSelectComponent } from '../measure-select/measure-select.component'
import { NgmPropertyArrayComponent } from '../property-array/property-array.component'


@Component({
  standalone: true,
  selector: 'ngm-conditional-aggregation',
  templateUrl: './conditional-aggregation.component.html',
  styleUrls: ['./conditional-aggregation.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmConditionalAggregationComponent)
    }
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    TranslateModule,
    NgmCommonModule,
    NgmParameterSelectComponent,
    NgmMeasureSelectComponent,
    NgmPropertyArrayComponent
  ]
})
export class NgmConditionalAggregationComponent implements ControlValueAccessor, OnInit {
  DISPLAY_BEHAVIOUR = DisplayBehaviour
  AggregationOperation = AggregationOperation
  PropertyCapacity = PropertyCapacity

  private formBuilder = inject(FormBuilder)

  OPERATIONS = AggregationOperations
  HAS_VALUE_OPERATIONS = [AggregationOperation.TOP_COUNT, AggregationOperation.TOP_PERCENT, AggregationOperation.TOP_SUM]

  @Input() dataSettings: DataSettings
  @Input()
  get entityType() {
    return this.entityType$()
  }
  set entityType(value) {
    this.entityType$.set(value)
  }
  private entityType$ = signal<EntityType>(null)

  // @Input() coreService: NxCoreService
  @Input() dsCoreService: NgmDSCoreService

  measures: Array<Property>
  useConditional = false

  formGroup: FormGroup

  filterMeasure: (measure: PropertyMeasure) => boolean = (measure) => isNil(this.formGroup?.value?.name) ? true :
    measure.name !== this.formGroup.value.name
  
  private _onChange: any

  // 排除指标度量后的度量列表
  public readonly measures$ = computed(() => {
    return sortBy(
      getEntityMeasures(this.entityType).filter((property) => negate(isIndicatorMeasureProperty)(property)),
      'calculationType'
    ).reverse()
  })

  ngOnInit(): void {
    this.measures = getEntityMeasures(this.entityType)

    this.formGroup = this.formBuilder.group({
      name: null,
      operation: null,
      value: null,
      measure: this.formBuilder.control(null, [Validators.required]),
      aggregationDimensions: null, //this.formBuilder.array([ ]),
      useConditionalAggregation: null,
      conditionalDimensions: null,
      excludeConditions: null
    })
    this.formGroup.valueChanges.subscribe((value) => {
      this._onChange?.(value)
    })
  }

  writeValue(obj: any): void {
    this.formGroup.patchValue(obj || {})
  }
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}
}
