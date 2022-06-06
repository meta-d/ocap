import { Component, forwardRef, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { TableVirtualScrollDataSource } from '@metad/ocap-angular/common'
import { DisplayDensity } from '@metad/ocap-angular/core'
import {
  DataSettings,
  Dimension,
  FilterSelectionType,
  getEntityProperty,
  getPropertyCaption,
  getPropertyHierarchy,
  ISlicer,
} from '@metad/ocap-core'
import { ComponentStore } from '@metad/store'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import { debounceTime, distinctUntilChanged, map, shareReplay } from 'rxjs/operators'
import { NgmSmartFilterService } from '../smart-filter.service'
import { ControlOptions } from '../types'

export interface MemberTableOptions extends ControlOptions {
  label?: string
  placeholder?: string
  maxTagCount?: number
  autoActiveFirst?: boolean
}

export interface MemberTableState {
  slicer: ISlicer
  options?: MemberTableOptions
}

@UntilDestroy()
@Component({
  selector: 'ngm-member-table',
  templateUrl: 'member-table.component.html',
  styleUrls: ['member-table.component.scss'],
  providers: [
    NgmSmartFilterService,
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MemberTableComponent)
    }
  ]
})
export class MemberTableComponent<T>
  extends ComponentStore<MemberTableState>
  implements OnInit, OnChanges, ControlValueAccessor
{
  @HostBinding('class.ngm-member-table') _isMemberTableComponent = true

  @Input() dataSettings: DataSettings
  @Input() dimension: Dimension
  @Input() get options() {
    return this.get((state) => state.options)
  }
  set options(value) {
    this.patchState({ options: value })
  }

  itemSize = 50
  searchControl = new FormControl()
  dataSource = new TableVirtualScrollDataSource<T>([])

  public readonly options$ = this.select((state) => state.options)
  public readonly selctionType$ = this.options$.pipe(map((options) => options?.selectionType))
  public readonly multiple$ = this.selctionType$.pipe(
    map((selctionType) => selctionType === FilterSelectionType.Multiple)
  )
  public readonly slicer$ = this.select((state) => state.slicer)

  public readonly results$ = this.smartFilterService.selectResult()
  public readonly columns$ = this.results$.pipe(map((result) => result?.schema?.columns))
  public readonly displayedColumns$ = this.columns$.pipe(
    map((cols) => ['select', ...(cols ?? []).map((col) => col.name)]),
    shareReplay(1)
  )

  onChange: (input: any) => void

  constructor(private smartFilterService: NgmSmartFilterService<T>) {
    super({ slicer: {} })
  }

  ngOnInit() {
    this.smartFilterService
      .onAfterServiceInit()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.smartFilterService.refresh()
      })
    this.slicer$.pipe(distinctUntilChanged(isEqual), untilDestroyed(this)).subscribe((slicer) => {
      this.onChange?.({
        ...slicer,
        dimension: this.dimension
      })
    })

    this.results$.pipe(untilDestroyed(this)).subscribe((results) => {
      if (results.data) {
        this.dataSource.data = results.data as T[]
      }
    })
    this.searchControl.valueChanges.pipe(debounceTime(500)).subscribe((text) => {
      this.dataSource.filter = text.trim().toLowerCase()
    })

    this.options$.pipe(map((options) => {
      switch(options?.displayDensity) {
        case DisplayDensity.compact:
          return 30
        case DisplayDensity.cosy:
          return 40
        default:
          return 50
      }
    })).subscribe((itemSize) => this.itemSize = itemSize)
  }
  ngOnChanges({ dataSettings, dimension }: SimpleChanges): void {
    if (dataSettings?.currentValue) {
      this.smartFilterService.dataSettings = dataSettings.currentValue
    }
    if (dimension?.currentValue) {
      this.smartFilterService.options = { dimension: dimension.currentValue }
    }
  }
  writeValue(obj: any): void {
    if (obj) {
      this.patchState({ slicer: {...obj} })
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

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const members = this.get((state) => state.slicer?.members)
    const numSelected = members?.length
    const numRows = this.dataSource.data.length
    return numSelected === numRows
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.clearMembers()
      return
    }

    this.selectMembers(this.dataSource.data)
  }

  hasMember() {
    const members = this.get((state) => state.slicer?.members)
    return !isEmpty(members)
  }

  isSelected(row: T) {
    const members = this.get((state) => state.slicer?.members)
    const value = row[getPropertyHierarchy(this.dimension)]
    return !!members?.find((item) => item.value === value)
  }

  readonly toggleMember = this.updater((state, row: T) => {
    const property = getEntityProperty(this.smartFilterService.entityType, this.dimension)
    const caption = getPropertyCaption(property)
    const member = {
      value: row[getPropertyHierarchy(this.dimension)],
      label: row[caption]
    }

    const index = state.slicer.members?.findIndex((item) => item.value === member.value)
    if (index > -1) {
      state.slicer.members.splice(index, 1)
    } else {
      state.slicer.members = state.slicer.members || []
      if (this.options?.selectionType === FilterSelectionType.Multiple) {
        state.slicer.members.push(member)
      } else {
        state.slicer.members = [member]
      }
    }
  })

  readonly selectMembers = this.updater((state, members: T[]) => {
    const property = getEntityProperty(this.smartFilterService.entityType, this.dimension)
    const caption = getPropertyCaption(property)

    state.slicer.members = members.map((row) => ({
      value: row[getPropertyHierarchy(this.dimension)],
      label: row[caption]
    }))
  })

  readonly clearMembers = this.updater((state) => {
    state.slicer.members = []
  })
}
