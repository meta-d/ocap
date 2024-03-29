import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  forwardRef,
  inject
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { NxCoreService } from '@metad/core'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { DataSettings, Dimension, EntityType, Measure, isEmpty } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { filter } from 'rxjs/operators'
import { PropertyCapacity, PropertySelectComponent } from '../property-select/property-select.component'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-property-array',
  templateUrl: 'property-array.component.html',
  styleUrls: ['property-array.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PropertyArrayComponent)
    }
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    DragDropModule,
    TranslateModule,
    NgmCommonModule,
    PropertySelectComponent
  ]
})
export class PropertyArrayComponent implements ControlValueAccessor {
  private readonly formBuilder = inject(FormBuilder)
  private readonly _cdr = inject(ChangeDetectorRef)

  @Input() dataSettings: DataSettings
  @Input() entityType: EntityType
  @Input() coreService: NxCoreService
  @Input() dsCoreService: NgmDSCoreService
  @Input() capacities: PropertyCapacity[]

  formArray = this.formBuilder.array([])

  @HostBinding('class.ngm-property-array__empty')
  get isEmpty() {
    return !this.formArray.length
  }

  private onChange: any
  private onTouched: any

  private valueSub = this.formArray.valueChanges
    .pipe(
      filter((value) => !isEmpty(value)),
      takeUntilDestroyed()
    )
    .subscribe((value) => {
      this.onChange?.(value)
    })

  writeValue(obj: any): void {
    this.setValue(obj ?? [])
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.formArray.disable() : this.formArray.enable()
  }

  create(item?) {
    return this.formBuilder.control(
      item || {
        dimension: null,
        members: []
      }
    )
  }

  add() {
    this.formArray.push(this.create())
  }

  remove(i: number) {
    this.formArray.removeAt(i)
  }

  setValue(dimensions: Array<Dimension | Measure>) {
    this.formArray.reset()
    dimensions?.forEach((dimension) => {
      this.formArray.push(this.create(dimension))
    })

    this._cdr.detectChanges()
  }

  drop(event: CdkDragDrop<AbstractControl[]>) {
    moveItemInArray(this.formArray.controls, event.previousIndex, event.currentIndex)
  }
}
