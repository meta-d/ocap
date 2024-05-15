import { Component, DestroyRef, OnInit, computed, effect, inject, input, output, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'
import { AbstractControl, FormBuilder, FormControl, ValidatorFn, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatFormFieldAppearance } from '@angular/material/form-field'
import { uuid } from '@metad/components/core'
import { NxCoreService } from '@metad/core'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import {
  CalculatedProperty,
  CalculationProperty,
  CalculationType,
  DataSettings,
  EntityType,
  Syntax,
  isEntityType,
  nonNullable,
} from '@metad/ocap-core'
import { EMPTY, filter, switchMap } from 'rxjs'

export interface CalculationEditorData {
  dataSettings: DataSettings
  coreService: NxCoreService
  dsCoreService: NgmDSCoreService
  entityType: EntityType
  syntax: Syntax
  value: CalculationProperty
}

@Component({
  selector: 'ngm-calculation-editor',
  templateUrl: './calculation-editor.component.html',
  styleUrls: ['./calculation-editor.component.scss'],
})
export class CalculationEditorComponent implements OnInit {
  /**
  |--------------------------------------------------------------------------
  | Types
  |--------------------------------------------------------------------------
  */
  CALCULATION_TYPE = CalculationType
  SYNTAX = Syntax
  /**
  |--------------------------------------------------------------------------
  | Injectors
  |--------------------------------------------------------------------------
  */
  readonly destroyRef = inject(DestroyRef)
  readonly fb = inject(FormBuilder)
  public dsCoreService? = inject(NgmDSCoreService, {optional: true})
  readonly dialogRef? = inject(MatDialogRef<CalculationEditorComponent>, {optional: true})
  readonly data? = inject<CalculationEditorData>(MAT_DIALOG_DATA, {optional: true})

  /**
  |--------------------------------------------------------------------------
  | Inputs & Outputs
  |--------------------------------------------------------------------------
  */
  readonly appearance = input<MatFormFieldAppearance>('fill')
  readonly dataSettings = input<DataSettings>()
  readonly value = input<CalculationProperty>()
  
  readonly apply = output<CalculationProperty>()
  
  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly #syntax = signal<Syntax>(null)
  readonly _dataSettings = signal<DataSettings>(null)
  readonly entityType = signal<EntityType>(null)
  readonly entitySyntax = computed(() => this.#syntax() ?? this.entityType()?.syntax)

  public coreService: NxCoreService

  readonly formGroup = this.fb.group({
    __id__: uuid(),
    calculationType: [CalculationType.Calculated, Validators.required],
    name: ['', [Validators.required, this.forbiddenNameValidator()]],
    caption: [''],
    formatting: this.fb.group({
      unit: [null],
      decimal: [null],
    })
  })
  readonly calculationType = this.formGroup.get('calculationType') as FormControl
  readonly name = this.formGroup.get('name') as FormControl
  readonly caption = this.formGroup.get('caption') as FormControl
  readonly unit = this.formGroup.get('formatting').get('unit') as FormControl

  readonly calculation = new FormControl()
  readonly formula = new FormControl()

  /**
   * 当作为修改状态时 disable calculationType 的选择 和 name 的输入
   */
  disableSelect: boolean

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effects)
  |--------------------------------------------------------------------------
  */
  private entityTypeSub = toObservable(this._dataSettings).pipe(
    filter(nonNullable),
    switchMap((dataSettings) => this.dsCoreService?.getDataSource(dataSettings.dataSource).pipe(
      switchMap((dataSource) =>
        dataSource.selectEntityType(dataSettings.entitySet).pipe(filter(isEntityType))
      )
    ) ?? EMPTY),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe((entityType) => (this.entityType.set(entityType)))

  constructor() {
    if (this.data?.dsCoreService) {
      this.dsCoreService = this.data?.dsCoreService
    }

    effect(() => {
      if (this.dataSettings()) {
        this._dataSettings.set(this.dataSettings())
      }
    }, { allowSignalWrites: true })

    effect(() => {
      if (this.value()) {
        this.initValue(this.value())
      }
    })
  }

  ngOnInit(): void {
    if (this.data) {
      this._dataSettings.set(this.data.dataSettings)
      this.#syntax.set(this.data.syntax)
      this.coreService = this.data.coreService
    }

    if (this.data?.value) {
      this.initValue(this.data.value)
    }
  }

  initValue(value: CalculationProperty) {
    this.disableSelect = true
    this.formGroup.get('calculationType').disable()
    this.formGroup.get('name').disable()
    this.formGroup.patchValue(value)
    this.formGroup.markAsPristine()
    this.calculation.setValue({
      ...value,
    })
    this.calculation.markAsPristine()
    this.formula.setValue((value as CalculatedProperty).formula)
    this.formula.markAsPristine()
  }

  onApply() {
    const property = {
      ...this.calculation.value,
      ...this.formGroup.value,
      calculationType: this.calculationType.value,
      formula: this.calculationType.value === CalculationType.Calculated ? this.formula.value : null,
      name: this.name.value,
      visible: true
    } as CalculationProperty

    this.dialogRef?.close(property)
    this.apply.emit(property)
  }

  onCancel() {
    this.dialogRef?.close()
    this.apply.emit(null)
  }

  forbiddenNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const forbidden =
        !this.disableSelect &&
        this.entityType()?.properties &&
        !!Object.values(this.entityType().properties).find((item) => item.name === control.value)
      return forbidden ? { forbiddenName: { value: control.value } } : null
    }
  }
}
