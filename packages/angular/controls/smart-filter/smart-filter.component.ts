import { COMMA, ENTER } from '@angular/cdk/keycodes'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { MatDialog } from '@angular/material/dialog'
import { NgmAppearance } from '@metad/ocap-angular/core'
import { DataSettings, FilterSelectionType, getEntityProperty, IMember, ISlicer } from '@metad/ocap-core'
import { ComponentStore } from '@metad/store'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import find from 'lodash/find'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import negate from 'lodash/negate'
import {
  combineLatest,
  combineLatestWith,
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
  startWith,
  withLatestFrom
} from 'rxjs'
import { NgmSmartFilterService } from '../smart-filter.service'
import { ControlOptions } from '../types'
import { ValueHelpDialog } from '../value-help/value-help.component'

export interface SmartFilterOptions extends ControlOptions {
  label?: string
  placeholder?: string
  maxTagCount?: number
  autoActiveFirst?: boolean
}

export interface SmartFilterState {
  options: SmartFilterOptions
  slicer: ISlicer
}

@UntilDestroy()
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-smart-filter',
  templateUrl: 'smart-filter.component.html',
  styleUrls: ['smart-filter.component.scss'],
  providers: [
    NgmSmartFilterService,
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SmartFilterComponent)
    }
  ]
})
export class SmartFilterComponent extends ComponentStore<SmartFilterState>
  implements OnInit, OnChanges, ControlValueAccessor
{
  @Input() dataSettings: DataSettings
  // @Input() dimension: Dimension

  @Input() get options() {
    return this.get((state) => state.options)
  }
  set options(value) {
    this.patchState({ options: value })
  }
  get dimension() {
    return this.options?.dimension
  }
  get slicer() {
    return this.get((state) => state.slicer)
  }
  @Input() appearance: NgmAppearance

  
  public readonly options$ = this.select((state) => state.options)
  public readonly dimension$ = this.options$.pipe(map((options) => options?.dimension))
  public readonly property$ = this.dimension$.pipe(
    combineLatestWith(this.smartFilterService.entityType$),
    map(([dimension, entityType]) => getEntityProperty(entityType, dimension))
  )

  public readonly label$ = combineLatest([this.options$.pipe(map((options) => options?.label)), this.property$]).pipe(
    map(([label, property]) => label || property?.label || property?.name)
  )
  public readonly placeholder$ = this.options$.pipe(map((options) => options?.placeholder))
  public readonly selectionType$ = this.options$.pipe(map((options) => options?.selectionType))
  public readonly multiple$ = this.selectionType$.pipe(
    map((selectionType) => selectionType === FilterSelectionType.Multiple)
  )
  public readonly maxTagCount$ = this.options$.pipe(map((options) => options?.maxTagCount ?? 1))
  public readonly autoActiveFirst$ = this.options$.pipe(map((options) => options?.autoActiveFirst))

  public readonly slicer$ = this.select((state) => state.slicer)
  public readonly members$ = this.slicer$.pipe(map((slicer) => slicer?.members))
  public readonly isNotInitial$ = this.members$.pipe(map(negate(isEmpty)))

  public readonly selectOptions$ = this.smartFilterService.selectOptions$.pipe(
    withLatestFrom(this.autoActiveFirst$, this.members$),
    map(([selectOptions, autoActiveFirst, members]) => {
      if (selectOptions[0] && autoActiveFirst && isEmpty(members)) {
        this.toggleMember(selectOptions[0])
      }
      return selectOptions
    }),
    combineLatestWith(this.members$),
    map(([selectOptions, members]) =>
      selectOptions?.map((option) => ({
        ...option,
        selected: !!find(members, { value: option.value })
      }))
    ),
    shareReplay(1)
  )

  // 输入框 tags
  public restChips
  public readonly chips$: Observable<Array<IMember>> = this.members$.pipe(
    withLatestFrom(this.maxTagCount$),
    map(([selectedMembers, maxTagCount]) => {
      const _chips = selectedMembers ? [...selectedMembers] : []
      if (maxTagCount) {
        this.restChips = _chips.splice(maxTagCount)
      }
      return _chips
    })
  )

  valueControl = new FormControl()
  selectable = true
  removable = true
  addOnBlur = true

  // 用户输入条件过滤出的选择列表
  public readonly filteredOptions$ = this.valueControl.valueChanges.pipe(
    map((text) => (text ? `${text}`.toLowerCase() : text)),
    startWith(null),
    combineLatestWith(this.selectOptions$),
    map(
      ([text, selectOptions]) =>
        (text
          ? selectOptions?.filter(
              (option) => option.label?.toLowerCase().includes(text) || `${option.value}`.toLowerCase().includes(text)
            )
          : selectOptions) ?? []
    )
  )
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]

  @ViewChild('search') searchInput: ElementRef<HTMLInputElement>

  onChange: (input: ISlicer) => any
  constructor(private smartFilterService: NgmSmartFilterService, public dialog: MatDialog) {
    super({ slicer: {} } as SmartFilterState)
  }

  ngOnInit() {
    this.smartFilterService
      .onAfterServiceInit()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.smartFilterService.refresh()
      })
    this.slicer$
      .pipe(distinctUntilChanged(isEqual), withLatestFrom(this.dimension$), untilDestroyed(this))
      .subscribe(([slicer, dimension]) => {
        this.onChange?.({
          ...slicer,
          dimension
        })
      })
  }

  ngOnChanges({ dataSettings, options }: SimpleChanges): void {
    if (dataSettings?.currentValue) {
      this.smartFilterService.dataSettings = dataSettings.currentValue
    }
    if (options?.currentValue) {
      this.smartFilterService.options = options.currentValue
    }
  }

  writeValue(obj: any): void {
    if (obj) {
      this.patchState({ slicer: obj })
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    //
  }
  setDisabledState?(isDisabled: boolean): void {
    //
  }

  /**
   * 向后兼容
   */
  readonly removeMember = this.updater((state, { value }: IMember) => {
    state.slicer.members = state.slicer.members.filter((member) => member.value !== value)
  })

  readonly clearMembers = this.updater((state) => {
    state.slicer.members = []
  })

  selectMember(event: MatAutocompleteSelectedEvent) {
    this.toggleMember(event.option.value)
    this.searchInput.nativeElement.value = ''
    this.valueControl.setValue(null)
  }

  readonly toggleMember = this.updater((state, member: IMember) => {
    if (this.options?.selectionType === FilterSelectionType.Multiple) {
      const index = state.slicer.members?.findIndex((item) => item.value === member.value)
      if (index > -1) {
        state.slicer.members.splice(index, 1)
      } else {
        state.slicer.members = state.slicer.members || []
        state.slicer.members.push({
          value: member.value,
          label: member.label
        })
      }
    } else {
      state.slicer.members = [{
        value: member.value,
        label: member.label
      }]
    }
  })

  openValueHelp(event) {
    this.dialog
      .open(ValueHelpDialog, {
        data: {
          dataSettings: this.dataSettings,
          dimension: this.dimension,
          options: this.options,
          slicer: this.slicer
        }
      })
      .afterClosed()
      .subscribe((slicer) => {
        if (slicer) {
          this.patchState({ slicer })
        }
      })
  }
}
