import {
  booleanAttribute,
  Component,
  computed,
  EventEmitter,
  forwardRef,
  inject,
  input,
  Input,
  OnInit,
  Output
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import {
  DisplayBehaviour,
  getEntityDimensions,
  getEntityVariables,
  getPropertyName,
  ISlicer,
  nonNullable,
  Syntax
} from '@metad/ocap-core'
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

  readonly inline = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  // @Input() limit: number
  // @Input() capacities: SlicersCapacity[]
  readonly limit = input<number>()
  readonly capacities = input<SlicersCapacity[]>()

  @Output() valueChange = new EventEmitter<ISlicer[]>()

  searchControl = new FormControl<string>(null)
  get highlight() {
    return this.searchControl.value
  }

  readonly showCombinationSlicer = computed(() => this.entityTypeSignal()?.syntax === Syntax.SQL && this.capacities()?.includes(SlicersCapacity.CombinationSlicer))
  readonly showAdvancedSlicer = computed(() => this.entityTypeSignal()?.syntax === Syntax.MDX && this.capacities()?.includes(SlicersCapacity.AdvancedSlicer))
  readonly showVariable = computed(() => this.entityTypeSignal()?.syntax === Syntax.MDX && this.capacities()?.includes(SlicersCapacity.Variable))

  readonly dimensions$ = this.entityType$.pipe(
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
  readonly variables$ = this.entityType$.pipe(
    filter(nonNullable),
    combineLatestWith(this.searchControl.valueChanges.pipe(startWith(''))),
    map(([entityType, search]) => {
      const variables = getEntityVariables(entityType)
      const text = search?.trim().toLowerCase()
      return text
        ? variables.filter(
            (item) => item.name.toLowerCase().includes(text) || item.caption?.toLowerCase().includes(text)
          )
        : variables.slice()
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
