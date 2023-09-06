import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { Component, Inject, effect, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { Cube, Property } from '@metad/ocap-core'
import { nonNullable } from '@metad/core'
import { of } from 'rxjs'
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators'
import { SemanticModelService } from '../model.service'
import { MODEL_TYPE, SemanticModelEntityType } from '../types'


@Component({
  selector: 'pac-model-create-entity',
  templateUrl: 'create-entity.component.html',
  styleUrls: ['create-entity.component.scss']
})
export class ModelCreateEntityComponent {
  SemanticModelEntityType = SemanticModelEntityType
  MODEL_TYPE = MODEL_TYPE

  private readonly modelService = inject(SemanticModelService)

  modelType: MODEL_TYPE
  hiddenTable = false

  primaryKey: string
  columns: {
    name: string
    caption: string
    visible: boolean
    dataType?: string
    measure?: boolean
    dimension?: Property
  }[] = []
  cubes: Cube[] = []
  table = new FormControl(null)
  type = new FormControl<SemanticModelEntityType>(null, [Validators.required])
  name = new FormControl(null, [Validators.required, this.forbiddenNameValidator()])

  formGroup = new FormGroup({
    type: this.type,
    name: this.name,
    caption: new FormControl('', [Validators.required]),
    table: this.table
  })

  expression: string
  // 加载中
  loading = false

  private readonly tableName$ = this.table.valueChanges.pipe(
    startWith(this.data.model?.table),
    debounceTime(300),
    distinctUntilChanged()
  )

  public filteredTables = this.tableName$.pipe(
    map((value) => {
      const name = typeof value === 'string' ? value : value?.name
      return name
        ? this.data.entitySets?.filter(
            (item) => item.caption?.includes(name) || item.label?.includes(name) || item.name.includes(name)
          )
        : this.data.entitySets.slice()
    })
  )

  public readonly cubes$ = this.modelService.cubeStates$.pipe(map((states) => states.map((state) => state.cube)))

  private readonly entityColumns = toSignal(
    this.tableName$.pipe(
      tap(() => (this.loading = true)),
      switchMap((tableName) => (tableName ? this.modelService.selectOriginalEntityProperties(tableName) : of([]))),
      tap(() => (this.loading = false))
    )
  )

  private readonly entityType = toSignal(this.type.valueChanges)
  public readonly sharedDimensions = toSignal(this.modelService.sharedDimensions$)

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialogRef: MatDialogRef<ModelCreateEntityComponent>) {
    this.expression = this.data.model?.expression
    this.modelType = this.data.modelType
    const initValue = {
      name: this.data.model?.name,
      table: this.data.model?.table,
      caption: this.data.model?.caption,
      type: null
    }
    if (this.modelType === MODEL_TYPE.XMLA) {
      initValue.type = SemanticModelEntityType.CUBE
      this.type.disable()
      this.hiddenTable = true
      if (initValue.name) {
        this.formGroup.get('name').disable()
      }
    }
    this.formGroup.patchValue(initValue)

    effect(
      () => {
        const columns = this.entityColumns()
        if (!columns) {
          return
        }
        this.columns = [...columns.map((item) => ({ ...item }))]
        const type = this.entityType()

        // 自动判断实体类型
        if (!nonNullable(type) && this.columns.length > 0) {
          this.type.setValue(
            this.columns.find((item) => item.dataType === 'number')
              ? SemanticModelEntityType.CUBE
              : SemanticModelEntityType.DIMENSION
          )
        } else {
          // 自动设置关联维度和度量
          if (type === SemanticModelEntityType.CUBE) {
            const sharedDimensions = this.sharedDimensions()
            this.columns.forEach((item) => {
              const dimension = sharedDimensions.find(
                (dimension) => dimension.hierarchies?.[0]?.primaryKey === item.name
              )
              if (dimension) {
                item.dimension = dimension
              } else if (item.dataType === 'number') {
                item.measure = true
              }
            })
          } else if (type) {
            this.columns = this.columns.map((item) => ({
              ...item,
              dimension: null,
              measure: null
            }))
          }
        }
      },
      { allowSignalWrites: true }
    )
  }

  forbiddenNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      // Entity name can't be one of table name
      const forbidden = !!this.data.entitySets?.find((item) => item.name === control.value)
      return forbidden ? { forbiddenName: { value: control.value } } : null
    }
  }

  getErrorMessage() {
    if (this.name.hasError('required')) {
      return 'The name is required'
    }

    return this.name.hasError('forbiddenName') ? 'Must be unique from the table name' : ''
  }

  compareWithCube(a: Cube, b: Cube) {
    return a.name === b.name
  }

  drop(event: CdkDragDrop<Property[]>) {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex)
  }

  onSubmit(event) {
    if (this.formGroup.valid) {
      this.apply()
    }
  }

  apply() {
    this.dialogRef.close({
      ...this.formGroup.getRawValue(),
      expression: this.expression,
      primaryKey: this.primaryKey,
      columns: this.columns.filter((item) => item.visible || item.measure || item.dimension),
      cubes: this.cubes
    })
  }
}
