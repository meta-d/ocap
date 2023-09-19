import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { Component, EventEmitter, forwardRef, inject, Input, OnInit, Output } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { DisplayBehaviour, getEntityDimensions, getPropertyName, ISlicer, Syntax } from '@metad/ocap-core'
import { pick } from 'lodash-es'
import {
  BehaviorSubject,
  catchError,
  combineLatestWith,
  distinctUntilChanged,
  EMPTY,
  filter,
  firstValueFrom,
  map,
  startWith,
  switchMap
} from 'rxjs'
import { BaseSlicersComponent } from '../base-slicers'
import { SlicerBarComponent } from '../slicer-bar/slicer-bar.component'
import { SlicersCapacity } from '../types'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'


@Component({
  selector: 'ngm-slicers',
  templateUrl: 'slicers.component.html',
  styleUrls: ['slicers.component.scss'],
  inputs: ['dataSettings'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SlicersComponent)
    }
  ]
})
export class SlicersComponent extends BaseSlicersComponent implements OnInit, ControlValueAccessor {
  DisplayBehaviour = DisplayBehaviour
  SlicersCapacity = SlicersCapacity

  public readonly dsCoreService = inject(NgmDSCoreService)

  @Input() get slicers() {
    return this.slicers$.value
  }
  set slicers(value) {
    this.slicers$.next(value)
  }
  public slicers$ = new BehaviorSubject<ISlicer[]>([])

  @Input() get editable(): boolean {
    return this._editable
  }
  set editable(value: boolean | string) {
    this._editable = coerceBooleanProperty(value)
  }
  private _editable = false

  @Input() get inline(): boolean {
    return this._inline
  }
  set inline(value: boolean | string) {
    this._inline = coerceBooleanProperty(value)
  }
  private _inline = false

  @Input() limit: number
  @Input() capacities: SlicersCapacity[]

  @Output() valueChange = new EventEmitter<ISlicer[]>()

  searchControl = new FormControl<string>(null)
  get highlight() {
    return this.searchControl.value
  }

  get showCombinationSlicer() {
    return this.entityType?.syntax === Syntax.SQL && this.capacities?.includes(SlicersCapacity.CombinationSlicer)
  }
  get showAdvancedSlicer() {
    return this.entityType?.syntax === Syntax.MDX && this.capacities?.includes(SlicersCapacity.AdvancedSlicer)
  }

  public readonly dimensions$ = this.entityType$.pipe(
    filter((val) => !!val),
    combineLatestWith(this.searchControl.valueChanges.pipe(startWith(''))),
    map(([entityType, search]) => {
      const dimensions = getEntityDimensions(entityType)
      const text = search?.trim().toLowerCase()
      return text
        ? dimensions.filter(
            (item) => item.name.toLowerCase().includes(text) || item.caption?.toLowerCase().includes(text)
          )
        : dimensions.slice()
    })
  )

  onChange: (input: any) => void
  isDisabled = false

  private entityTypeSub = this.dataSettings$
    .pipe(
      filter((value) => !!value),
      filter(({ dataSource, entitySet }) => !!dataSource && !!entitySet),
      switchMap(({ dataSource, entitySet }) =>
        this.dsCoreService.selectEntitySet(dataSource, entitySet).pipe(
          /**
           * @todo 需要处理错误
           */
          catchError((error) => {
            console.error(error)
            return EMPTY
          })
        )
      ),
      map((entitySet) => entitySet?.entityType),
      takeUntilDestroyed()
    )
    .subscribe((entityType) => {
      this.entityType = entityType
    })

  ngOnInit() {
    this.slicers$.pipe(distinctUntilChanged()).subscribe((value) => {
      if (value) {
        this.valueChange.emit(value)
        this.onChange?.(value)
      }
    })
  }

  writeValue(obj: any): void {
    if (obj) {
      this.slicers = obj
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    //
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled
  }

  async openSlicerBar(event) {
    const slicer = await firstValueFrom(
      this._dialog
        .open(SlicerBarComponent, {
          data: {
            value: this.slicers,
            entityType: this.entityType,
            dataSettings: pick(this.dataSettings, ['dataSource', 'entitySet'])
          }
        })
        .afterClosed()
    )
    if (slicer) {
      this.slicers = [...slicer]
    }
  }

  update(value: ISlicer, index: number) {
    const values = [...this.slicers]
    values[index] = value
    this.slicers = values
  }

  remove(index: number) {
    const values = [...this.slicers]
    values.splice(index, 1)
    this.slicers = values
  }

  override async addSlicer(slicer: ISlicer) {
    this.slicers = this.slicers ?? []
    const index = this.slicers.findIndex(
      (item) => slicer.dimension && getPropertyName(item.dimension) === getPropertyName(slicer.dimension)
    )
    if (index > -1) {
      this.update(slicer, index)
    } else {
      this.slicers = [...this.slicers, slicer]
    }
  }
}
