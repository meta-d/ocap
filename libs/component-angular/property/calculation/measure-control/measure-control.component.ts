import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { Component, forwardRef, Input } from '@angular/core'
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms'
import { MatSelectionListChange } from '@angular/material/list'
import {
  CalculationProperty,
  CalculationType,
  DisplayBehaviour,
  EntityType,
  getEntityMeasures,
  isMeasureControlProperty,
  Property
} from '@metad/ocap-core'
import { BehaviorSubject } from 'rxjs'
import { map, tap } from 'rxjs/operators'

@Component({
  selector: 'ngm-measure-control',
  templateUrl: './measure-control.component.html',
  styles: [
    `
      .mat-selection-list {
        max-height: 100%;
        overflow-y: auto;
      }
      .ngm-cdk__drag-list {
        &.cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
          transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
        }
      }
    `
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MeasureControlComponent)
    }
  ]
})
export class MeasureControlComponent implements ControlValueAccessor {
  DISPLAY_BEHAVIOUR = DisplayBehaviour

  @Input() get entityType(): EntityType {
    return this.entityType$.value
  }
  set entityType(value) {
    this.entityType$.next(value)
  }
  private entityType$ = new BehaviorSubject<EntityType>(null)
  readonly measures$ = new BehaviorSubject<Property[]>([])

  formGroup: FormGroup = this.formBuilder.group({
    displayBehaviour: DisplayBehaviour.descriptionAndId,
    allMeasures: null,
    availableMembers: [],
    value: null
  })

  get measures() {
    return this.formGroup.get('availableMembers')
  }
  get displayBehaviour() {
    return this.formGroup.get('displayBehaviour') as FormControl<DisplayBehaviour>
  }

  selectedMeasures: string[] = []

  private _onChange: any
  constructor(private formBuilder: FormBuilder) {
    this.entityType$
      .pipe(
        map(
          (entityType) =>
            getEntityMeasures(entityType)
              .filter((property) => !isMeasureControlProperty(property))
              .sort((a, b) => {
                // 让 calculationType is Indicator 的往最后排
                if ((b as CalculationProperty).calculationType === CalculationType.Indicator) {
                  return -1
                }
                if ((a as CalculationProperty).calculationType === CalculationType.Indicator) {
                  return 1
                }
                return (a as CalculationProperty).calculationType > (b as CalculationProperty).calculationType ? 1 : -1
              })
        ),
        tap((value) => console.log(value))
      )
      .subscribe(this.measures$)

    this.formGroup.valueChanges.subscribe((value) => {
      this._onChange?.(value)
    })
  }

  writeValue(obj: any): void {
    if (obj) {
      this.formGroup.patchValue(obj)
      this.selectedMeasures = obj.availableMembers?.map((member) => member.value)
    }
  }
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}

  drop(event: CdkDragDrop<Property[]>) {
    moveItemInArray(this.measures$.value, event.previousIndex, event.currentIndex)
    this.measures$.next(this.measures$.value)
    this.onSelectionChange()
  }

  onSelectionChange(event?: MatSelectionListChange) {
    this.measures.setValue(
      this.measures$.value
        .filter((property) => this.selectedMeasures.includes(property.name))
        .map((property) => ({
          value: property.name,
          label: property.caption
        }))
    )
  }
}
