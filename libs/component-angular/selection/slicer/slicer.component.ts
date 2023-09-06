import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core'
import {
  DataSettings,
  ISlicer,
  advancedSlicerAsString,
  getEntityProperty,
  isAdvancedFilter,
  isAdvancedSlicer,
  isTimeRangesSlicer,
  slicerAsString,
  timeRangesSlicerAsString
} from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { BehaviorSubject, combineLatest, combineLatestWith, filter, map, withLatestFrom } from 'rxjs'
import { BaseSlicersComponent } from '../base-slicers'
import { MatChipListboxChange } from '@angular/material/chips'
import { toSignal } from '@angular/core/rxjs-interop'
import { nonNullable } from '@metad/core'


@Component({
  selector: 'nx-slicer',
  templateUrl: 'slicer.component.html',
  styleUrls: ['slicer.component.scss']
})
export class SlicerComponent extends BaseSlicersComponent {
  private translate = inject(TranslateService)

  @Input() get slicer() {
    return this.slicer$.value
  }
  set slicer(value) {
    this.slicer$.next(value)
  }
  private slicer$ = new BehaviorSubject<ISlicer>(null)

  @Input() get dataSettings(): DataSettings {
    return this.dataSettings$.value
  }
  set dataSettings(value) {
    this.dataSettings$.next(value)
  }
  public dataSettings$ = new BehaviorSubject<DataSettings>(null)

  @Input() editable: boolean
  @Input() disabled: boolean
  @Input() limit: number

  @Output() removed = new EventEmitter()
  @Output() slicerChange = new EventEmitter<ISlicer>()

  public readonly title$ = combineLatest([this.slicer$.pipe(filter((value) => !!value)), this.entityType$]).pipe(
    map(([slicer, entityType]) => {
      const SELECTION = this.translate.instant('COMPONENTS.SELECTION', {Default: 'Selection'})

      if (isAdvancedSlicer(slicer)) {
        return SELECTION?.AdvancedSlicer ?? 'Advanced Slicer'
      }

      if (isAdvancedFilter(slicer)) {
        return SELECTION?.CombinationSlicer ?? 'Combination Slicer'
      }

      if (entityType) {
        const property = getEntityProperty(entityType, slicer.dimension)
        return property?.caption || property?.name
      }
      return slicer.dimension?.dimension
    })
  )

  public readonly slicerSignal = toSignal(this.slicer$)
  public readonly members = computed(() => this.slicerSignal()?.members?.slice(0, this.limit || this.slicerSignal()?.members?.length)
    .filter(nonNullable) ?? [])
  public readonly more = computed(() => this.limit ? this.slicerSignal()?.members?.length - this.limit : 0)

  public readonly displayBehaviour$ = this.slicer$.pipe(map((slicer) => slicer?.dimension?.displayBehaviour))

  public readonly advancedSlicer$ = this.slicer$.pipe(
    combineLatestWith(this.translate.stream('COMPONENTS.SELECTION')),
    map(([slicer, SELECTION]) => {
      if (isAdvancedSlicer(slicer)) {
        return advancedSlicerAsString(slicer, SELECTION?.OnContext)
      } else if (isAdvancedFilter(slicer)) {
        return slicerAsString(slicer)
      } else if (isTimeRangesSlicer(slicer)) {
        return timeRangesSlicerAsString(slicer, SELECTION?.TimeRanges)
      }

      return null
    })
  )

  remove() {
    this.removed.emit()
  }

  removeMember(index) {
    const value = {
      ...this.slicer,
      members: [...this.slicer.members]
    }
    value.members.splice(index, 1)
    this.slicer = value
    this.slicerChange.emit(value)
  }

  async editSlicer() {
    const slicer = await this.openSlicerEditor(this.slicer)
    if (slicer) {
      this.slicer = {
        ...this.slicer,
        ...slicer
      }
      this.slicerChange.emit(this.slicer)
    }
  }

  onSlicersChange(event: MatChipListboxChange) {
    console.log(event.value)
  }
}
