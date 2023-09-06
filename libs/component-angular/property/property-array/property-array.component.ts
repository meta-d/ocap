import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  OnInit,
  forwardRef
} from '@angular/core'
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  UntypedFormBuilder
} from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { DataSettings, Dimension, EntityType, Measure } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { TranslateModule } from '@ngx-translate/core'
import { NxCoreService } from '@metad/core'
import { isEmpty } from 'lodash-es'
import { filter } from 'rxjs/operators'
import { PropertyCapacity, PropertySelectComponent } from '../property-select/property-select.component'

@UntilDestroy()
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nx-property-array',
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
export class PropertyArrayComponent implements OnInit, ControlValueAccessor {
  @Input() dataSettings: DataSettings
  @Input() entityType: EntityType
  @Input() coreService: NxCoreService
  @Input() dsCoreService: NgmDSCoreService
  @Input() capacities: PropertyCapacity[]

  formArray = this.formBuilder.array([])

  @HostBinding('class.nx-property-array__empty')
  get isEmpty() {
    return !this.formArray.length
  }

  private onChange: any

  constructor(private formBuilder: UntypedFormBuilder, private _cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.formArray.valueChanges
      .pipe(
        filter((value) => !isEmpty(value)),
        untilDestroyed(this)
      )
      .subscribe((value) => {
        this.onChange?.(value)
      })
  }

  writeValue(obj: any): void {
    this.setValue(obj || [])
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}

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
