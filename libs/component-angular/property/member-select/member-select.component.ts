import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  InjectFlags,
  Input,
  ViewContainerRef
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatFormFieldAppearance } from '@angular/material/form-field'
import { NgmValueHelpComponent } from '@metad/ocap-angular/controls'
import {
  AggregationRole,
  CompareToEnum,
  DataSettings,
  Dimension,
  DisplayBehaviour,
  EntityType,
  FilterSelectionType,
  getEntityProperty,
  isSemanticCalendar
} from '@metad/ocap-core'
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, firstValueFrom, map } from 'rxjs'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-property-member-select',
  templateUrl: './member-select.component.html',
  styleUrls: ['./member-select.component.scss'],
  host: {
    class: 'ngm-property-member-select'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PropertyMemberSelectComponent)
    }
  ]
})
export class PropertyMemberSelectComponent implements ControlValueAccessor {
  AggregationRole = AggregationRole
  DISPLAY_BEHAVIOUR = DisplayBehaviour.descriptionAndId
  COMPARE_TO_ENUM = CompareToEnum

  private readonly _dialog? = inject(MatDialog, InjectFlags.Optional)
  private readonly _viewContainerRef = inject(ViewContainerRef)

  @Input() appearance: MatFormFieldAppearance = 'fill'
  @Input() label: string
  @Input() get dataSettings() {
    return this.dataSettings$.value
  }
  set dataSettings(value) {
    this.dataSettings$.next(value)
  }
  private readonly dataSettings$ = new BehaviorSubject<DataSettings>(null)
  @Input() entityType: EntityType
  @Input() get dimension(): Dimension {
    return this.dimension$.value
  }
  set dimension(value) {
    this.dimension$.next(value)
  }
  private dimension$ = new BehaviorSubject<Dimension>(null)

  @Input() disabled: boolean

  public readonly property$ = this.dimension$.pipe(map((dimension) => getEntityProperty(this.entityType, dimension)))

  readonly formGroup: FormGroup = new FormGroup({
    type: new FormControl(null, Validators.required),
    value: new FormControl(null)
  })

  public readonly trigger$ = combineLatest([this.property$, this.formGroup.valueChanges]).pipe(
    map(([property, model]) => {
      if (!property) {
        return 'No Base dimension'
      }
      if (model.type === CompareToEnum.SelectedMember) {
        return property.caption + ': ' + model.value
      } else if (model.type) {
        return property.caption + `: ${model.type}`
      }

      return property.caption
    })
  )

  get type() {
    return this.formGroup.value.type
  }
  set type(value) {
    this.formGroup.patchValue({ type: value })
  }

  get value() {
    return this.formGroup.value.value
  }
  set value(value) {
    this.formGroup.patchValue({ value: value })
  }

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly isCalendar$ = toSignal(this.property$.pipe(map((property) => isSemanticCalendar(property))))

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private _typeChanging = this.formGroup
    .get('type')
    .valueChanges.pipe(distinctUntilChanged())
    .subscribe((type) => {
      if (type === CompareToEnum.CurrentMember) {
        this.value = null
      }
    })

  private valueChangesSub = this.formGroup.valueChanges.pipe(filter(() => this.formGroup.valid)).subscribe((value) => {
    this._onChange?.(value)
  })

  private _onChange: any

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

  async selectByMember(event) {
    event.stopPropagation()
    const slicer = await firstValueFrom(
      this._dialog
        .open(NgmValueHelpComponent, {
          viewContainerRef: this._viewContainerRef,
          data: {
            dimension: this.dimension,
            slicer: {
              members: this.type === CompareToEnum.SelectedMember && this.value ? [{ value: this.value }] : []
            },
            dataSettings: this.dataSettings,
            options: {
              selectionType: FilterSelectionType.Single,
              searchable: true,
              initialLevel: 1
            }
          }
        })
        .afterClosed()
    )

    if (slicer) {
      this.formGroup.patchValue({
        type: CompareToEnum.SelectedMember,
        value: slicer.members?.[0]?.value
      })
    }
  }
}
