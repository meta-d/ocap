import { Component, HostBinding, Inject, Input, Optional, inject } from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import {
  AdvancedSlicerOperator,
  DataSettings,
  DisplayBehaviour,
  EntityType,
  getEntityMeasures,
  nonNullable
} from '@metad/ocap-core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { PropertyCapacity } from '@metad/components/property'
import { NxCoreService } from '@metad/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators'

const ADVANCED_SLICER_OPERATORS = [
  {
    value: AdvancedSlicerOperator.Equal,
    label: '等于'
  },
  {
    value: AdvancedSlicerOperator.NotEqual,
    label: '不等于'
  },
  {
    value: AdvancedSlicerOperator.LessThan,
    label: '小于'
  },
  {
    value: AdvancedSlicerOperator.GreaterThan,
    label: '大于'
  },
  {
    value: AdvancedSlicerOperator.LessEqual,
    label: '小于等于'
  },
  {
    value: AdvancedSlicerOperator.GreaterEqual,
    label: '大于等于'
  },
  {
    value: AdvancedSlicerOperator.Between,
    label: '介于',
    valueSize: 2
  },
  {
    value: AdvancedSlicerOperator.NotBetween,
    label: '不介于',
    valueSize: 2
  },
  {
    value: AdvancedSlicerOperator.TopCount,
    label: '前 N 的',
    hasOther: true
  },
  {
    value: AdvancedSlicerOperator.BottomCount,
    label: '后 N 的',
    hasOther: true
  },
  {
    value: AdvancedSlicerOperator.TopPercent,
    label: '前百分比的',
    hasOther: true
  },
  {
    value: AdvancedSlicerOperator.BottomPercent,
    label: '后百分比的',
    hasOther: true
  },
  {
    value: AdvancedSlicerOperator.TopSum,
    label: '前总数',
    hasOther: true
  },
  {
    value: AdvancedSlicerOperator.BottomSum,
    label: '后总数',
    hasOther: true
  }
]

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'ngm-advanced-slicer',
  templateUrl: './advanced-slicer.component.html',
  styleUrls: ['./advanced-slicer.component.scss']
})
export class AdvancedSlicerComponent {
  @HostBinding('class.ngm-dialog-container') isDialogContainer = true
  DisplayBehaviour = DisplayBehaviour
  PropertyCapacity = PropertyCapacity

  operators = ADVANCED_SLICER_OPERATORS

  public coreService = inject(NxCoreService)

  @Input() get dataSettings(): DataSettings {
    return this.dataSettings$.value
  }
  set dataSettings(value: DataSettings) {
    this.dataSettings$.next(value)
  }
  private dataSettings$ = new BehaviorSubject<DataSettings>(null)

  formGroup = new FormGroup({
    context: new FormControl(),
    path: new FormControl(),
    operator: new FormControl(),
    value: this._formBuilder.array([null, null]),
    measure: new FormControl(),
    other: new FormControl()
  })

  public readonly entityType$: Observable<EntityType> = this.dataSettings$.pipe(
    filter(nonNullable),
    switchMap(({ dataSource, entitySet }) => this.dsCoreService.selectEntitySet(dataSource, entitySet)),
    map(({ entityType }) => entityType)
  )

  public readonly operator$ = this.formGroup.valueChanges.pipe(
    startWith(this.formGroup.value),
    map(({ operator }) => {
      operator = operator || this.formGroup.value.operator
      return ADVANCED_SLICER_OPERATORS.find((item) => item.value === operator)
    }),
    shareReplay(1)
  )
  public readonly to$ = this.operator$.pipe(map((operator) => operator?.valueSize === 2))
  public readonly hasOther$ = this.operator$.pipe(map((operator) => operator?.hasOther))

  private _operatorChanged = this.formGroup.get('operator').valueChanges.subscribe((operator) => {
    if (ADVANCED_SLICER_OPERATORS.find((item) => item.value === operator)?.valueSize !== 2) {
      this.formGroup.patchValue({
        value: [this.formGroup.value.value[0], null]
      })
    }
  })

  constructor(
    public dsCoreService: NgmDSCoreService,
    private readonly _formBuilder: FormBuilder,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data,
    public dialogRef?: MatDialogRef<AdvancedSlicerComponent>
  ) {
    this.dataSettings = this.data?.dataSettings

    if (this.data?.model) {
      this.formGroup.patchValue(this.data.model)
    }
    if (this.data?.coreService) {
      this.coreService = this.data?.coreService
    }
  }

  onApply() {
    this.dialogRef.close(this.formGroup.value)
  }
}
