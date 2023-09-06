import { Component, Inject, Input, OnInit, Optional, inject } from '@angular/core'
import { AbstractControl, FormBuilder, FormControl, ValidatorFn, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatFormFieldAppearance } from '@angular/material/form-field'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import {
  CalculatedProperty,
  CalculationProperty,
  CalculationType,
  DataSettings,
  EntityType,
  isEntityType,
  Syntax,
} from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { uuid } from '@metad/components/core'
import { NxCoreService } from '@metad/core'
import { filter, switchMap } from 'rxjs'

export interface CalculationEditorData {
  dataSettings: DataSettings
  coreService: NxCoreService
  dsCoreService: NgmDSCoreService
  entityType: EntityType
  syntax: Syntax
  value: CalculationProperty
}

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'nx-calculation-editor',
  templateUrl: './calculation-editor.component.html',
  styleUrls: ['./calculation-editor.component.scss'],
})
export class CalculationEditorComponent implements OnInit {
  CALCULATION_TYPE = CalculationType
  SYNTAX = Syntax

  @Input() appearance: MatFormFieldAppearance = 'fill'
  @Input() dataSettings: DataSettings
  @Input() syntax: Syntax

  public dsCoreService? = inject(NgmDSCoreService, {optional: true})
  public entityType: EntityType

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
  public calculation: Partial<CalculationProperty> = {}
  get formula() {
    return (<CalculatedProperty>this.calculation).formula
  }
  set formula(value) {
    (<CalculatedProperty>this.calculation).formula = value
  }

  /**
   * 当作为修改状态时 disable calculationType 的选择 和 name 的输入
   */
  disableSelect: boolean
  constructor(
    private fb: FormBuilder,
    @Optional() public dialogRef?: MatDialogRef<CalculationEditorComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: CalculationEditorData
  ) {
    if (data?.dsCoreService) {
      this.dsCoreService = data?.dsCoreService
    }
  }

  ngOnInit(): void {
    if (this.data) {
      this.dataSettings = this.data.dataSettings
      this.syntax = this.data.syntax

      this.coreService = this.data.coreService

      this.dsCoreService?.getDataSource(this.dataSettings.dataSource)
        .pipe(
          switchMap((dataSource) =>
            dataSource.selectEntityType(this.dataSettings.entitySet).pipe(filter(isEntityType))
          ),
          untilDestroyed(this)
        )
        .subscribe((entityType) => (this.entityType = entityType))
    }

    if (this.data?.value) {
      this.disableSelect = true
      this.formGroup.get('calculationType').disable()
      this.formGroup.patchValue(this.data.value)
      this.calculation = {
        ...this.data.value,
      }
    }
  }

  onApply() {
    const property = {
      ...this.calculation,
      ...this.formGroup.value,
      calculationType: this.calculationType.value,
      formula: this.calculationType.value === CalculationType.Calculated ? this.formula : null,
      name: this.name.value,
      visible: true
    }

    this.dialogRef?.close(property)
  }

  forbiddenNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const forbidden =
        !this.disableSelect &&
        this.entityType?.properties &&
        !!Object.values(this.entityType.properties).find((item) => item.name === control.value)
      return forbidden ? { forbiddenName: { value: control.value } } : null
    }
  }
}
