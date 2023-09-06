import { Component, effect, EventEmitter, forwardRef, inject, Input, Output, signal } from '@angular/core'
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms'
import { AppearanceDirective, DensityDirective, NgmAppearance } from '@metad/ocap-angular/core'
import {
  DataSettings,
  Dimension,
  DisplayBehaviour,
  FilterSelectionType,
  getEntityProperty,
  IMember,
  isEmpty,
  isEqual,
  ISlicer,
  isNil,
} from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
  BehaviorSubject,
  combineLatest,
  combineLatestWith,
  distinctUntilChanged,
  firstValueFrom,
  map,
  of,
  shareReplay,
  switchMap,
  withLatestFrom
} from 'rxjs'
import { NgmSmartFilterService } from '../smart-filter.service'
import { ControlOptions } from '../types'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'
import { CommonModule } from '@angular/common'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatButtonModule } from '@angular/material/button'

export interface SmartSelectOptions extends ControlOptions {
  /**
   * 用户自定义成员
   */
  data?: Array<IMember>
}

@UntilDestroy({ checkProperties: true })
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    DensityDirective,
    AppearanceDirective
  ],
  selector: 'ngm-smart-select',
  templateUrl: 'smart-select.component.html',
  styleUrls: ['smart-select.component.scss'],
  host: {
    class: 'ngm-smart-select'
  },
  providers: [
    NgmSmartFilterService,
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NgmSmartSelectComponent)
    }
  ]
})
export class NgmSmartSelectComponent implements ControlValueAccessor
{
  private smartFilterService = inject(NgmSmartFilterService)

  private _dataSettings = signal<DataSettings>(null)
  @Input() get dataSettings(): DataSettings {
    return this._dataSettings()
  }
  set dataSettings(value: DataSettings) {
    this._dataSettings.set(value)
  }

  private _dimension = signal<Dimension>(null)
  @Input() get dimension(): Dimension {
    return this._dimension()
  }
  set dimension(value: Dimension) {
    this._dimension.set(value)
  }

  private _options = signal<SmartSelectOptions>(null)
  @Input() get options() {
    return this._options()
  }
  set options(value) {
    this._options.set(value)
  }
  private options$ = toObservable(this._options)

  @Input() appearance: NgmAppearance
  @Input() disabled: boolean

  @Output() loadingChanging = new EventEmitter<boolean>()

  get displayBehaviour() {
    return this.dimension?.displayBehaviour ?? DisplayBehaviour.descriptionOnly
  }

  public readonly property$ = toObservable(this._dimension).pipe(
    combineLatestWith(this.smartFilterService.selectEntityType()),
    map(([dimension, entityType]) => getEntityProperty(entityType, dimension))
  )
  public readonly label$ = combineLatest([this.options$.pipe(map((options) => options?.label)), this.property$]).pipe(
    map(([label, property]) => label || property?.caption || property?.name)
  )
  public readonly placeholder$ = this.options$.pipe(map((options) => options?.placeholder))
  public readonly autoActiveFirst$ = this.options$.pipe(map((options) => options?.autoActiveFirst))
  public readonly multiple$ = this.options$.pipe(
    map((options) => options?.selectionType === FilterSelectionType.Multiple || options?.multiple),
    distinctUntilChanged()
  )

  public readonly slicer$ = new BehaviorSubject<ISlicer | null>(null)
  public readonly members$ = this.slicer$.pipe(map((slicer) => slicer?.members))
  public readonly memberValues$ = this.members$.pipe(
    withLatestFrom(this.multiple$),
    map(([members, multiple]) => multiple ? members?.map(({ value }) => value) : members?.[0]?.value),
    distinctUntilChanged(isEqual)
  )
  public readonly isInitial$ = this.members$.pipe(map((members) => isEmpty(members)))

  public readonly data$ = this.options$.pipe(map((options) => options?.data))
  public readonly selectOptions$ = this.data$.pipe(
    map((data) => data?.filter((item) => !!item)),
    switchMap((data) => isEmpty(data) ? this.smartFilterService.selectOptions$ : of(data)),
    withLatestFrom(this.autoActiveFirst$, this.members$),
    map(([selectOptions, autoActiveFirst, members]) => {
      if (selectOptions[0] && autoActiveFirst && isEmpty(members)) {
        this.toggleMember(selectOptions[0])
      }
      return selectOptions
    }),
    untilDestroyed(this),
    shareReplay(1)
  )
  public readonly loading$ = this.smartFilterService.loading$

  onChange: (input: ISlicer) => any

  //
  private loadingSub = this.smartFilterService.loading$.pipe(takeUntilDestroyed()).subscribe((loading) => {
    this.loadingChanging.emit(loading)
  })
  private serviceSub = this.smartFilterService
    .onAfterServiceInit()
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.smartFilterService.refresh()
    })
  private slicerSub = this.slicer$.pipe(takeUntilDestroyed()).subscribe((slicer) => {
    this.onChange?.({
      ...slicer,
      dimension: this.dimension
    })
  })
 
  constructor() {
    effect(() => {
      if (this.dataSettings) {
        this.smartFilterService.dataSettings = this.dataSettings
      }
    })

    effect(() => {
      this.smartFilterService.options = {
        ...(this.options ?? {}),
        dimension: this.dimension
      }
    })

    effect(() => {
      if (this.options?.defaultMembers) {
        this.setMembers(this.options.defaultMembers)
      }
    }, {allowSignalWrites: true})
  }
  
  writeValue(obj: any): void {
    if (obj) {
      this.slicer$.next(obj)
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
    if (this.slicer$.value) {
      this.onChange(this.slicer$.value)
    }
  }
  registerOnTouched(fn: any): void {
    //
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  toggleMember(member: IMember) {
    const slicer = this.slicer$.value ?? {
      dimension: this.dimension,
    }
    if (this.options?.selectionType === FilterSelectionType.Multiple) {
      const index = slicer.members?.findIndex((item) => item.value === member.value)
      if (index > -1) {
        slicer.members.splice(index, 1)
      } else {
        slicer.members = slicer.members ?? []
        slicer.members.push({
          value: member.value,
          caption: member.caption
        })
      }
    } else {
      slicer.members = [
        {
          value: member.value,
          caption: member.caption
        }
      ]
    }

    this.slicer$.next(slicer)
    this.onChange?.(slicer)
  }

  async setSelectedValues(values: string[]) {
    const selectOptions = await firstValueFrom(this.selectOptions$)
    values = Array.isArray(values) ? values : isNil(values) ? null : [values]
    this.setMembers(values?.map((value) => selectOptions.find((item) => item.value === value) ?? { value }))
  }

  setMembers(members?: IMember[]) {
    const slicer = this.slicer$.value ?? {
      dimension: this.dimension,
    }
    slicer.members = [...(members ?? [])]
    this.slicer$.next(slicer)

    this.onChange?.(slicer)
  }
}
