import { CommonModule } from '@angular/common'
import { Component, computed, forwardRef, inject, Input, OnInit, signal } from '@angular/core'
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { NgmEntityModule } from '@metad/ocap-angular/entity'
import { NgmParameterSelectComponent } from '@metad/ocap-angular/parameter'
import {
  AggregationOperation,
  DataSettings,
  DisplayBehaviour,
  EntityType,
  getEntityMeasures,
  isIndicatorMeasureProperty,
  negate,
  Property
} from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { NxCoreService } from '@metad/core'
import { sortBy } from 'lodash-es'
import { PropertyArrayComponent } from '../../property-array/property-array.component'
import { PropertyCapacity } from '../../property-select/property-select.component'


@Component({
  standalone: true,
  selector: 'ngm-conditional-aggregation',
  templateUrl: './conditional-aggregation.component.html',
  styleUrls: ['./conditional-aggregation.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ConditionalAggregationComponent)
    }
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    TranslateModule,
    NgmCommonModule,
    PropertyArrayComponent,
    NgmParameterSelectComponent,
    NgmEntityModule
  ]
})
export class ConditionalAggregationComponent implements ControlValueAccessor, OnInit {
  DISPLAY_BEHAVIOUR = DisplayBehaviour
  AggregationOperation = AggregationOperation
  PropertyCapacity = PropertyCapacity

  private formBuilder = inject(FormBuilder)

  OPERATIONS = [
    {
      value: AggregationOperation.SUM,
      label: 'Sum'
    },
    {
      value: AggregationOperation.COUNT,
      label: 'Count'
    },
    {
      value: AggregationOperation.MIN,
      label: 'Min'
    },
    {
      value: AggregationOperation.MAX,
      label: 'Max'
    },
    {
      value: AggregationOperation.AVERAGE,
      label: 'Average'
    },
    {
      value: AggregationOperation.STDEV,
      label: 'Standard Deviation'
    },
    {
      value: AggregationOperation.STDEVP,
      label: 'Population Standard Deviation'
    },
    {
      value: AggregationOperation.MEDIAN,
      label: 'Median'
    },
    {
      value: AggregationOperation.TOP_PERCENT,
      label: 'Top Percent'
    },
    {
      value: AggregationOperation.TOP_COUNT,
      label: 'Top Count'
    }
  ]

  @Input() dataSettings: DataSettings
  @Input()
  get entityType() {
    return this.entityType$()
  }
  set entityType(value) {
    this.entityType$.set(value)
  }
  private entityType$ = signal<EntityType>(null)

  @Input() coreService: NxCoreService
  @Input() dsCoreService: NgmDSCoreService

  measures: Array<Property>
  useConditional = false

  formGroup: FormGroup

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
      operation: null,
      value: null,
      measure: null,
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
