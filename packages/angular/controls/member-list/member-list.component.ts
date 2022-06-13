import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { NgmAppearance } from '@metad/ocap-angular/core'
import { DataSettings, Dimension, FilterSelectionType, ISlicer } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { BehaviorSubject } from 'rxjs'
import { map, startWith, combineLatestWith } from 'rxjs/operators'
import { NgmSmartFilterService } from '../smart-filter.service'
import { ControlOptions } from '../types'


@UntilDestroy()
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-member-list',
  templateUrl: 'member-list.component.html',
  styleUrls: ['member-list.component.scss'],
  providers: [
    NgmSmartFilterService,
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MemberListComponent)
    }
  ]
})
export class MemberListComponent implements OnInit, OnChanges, ControlValueAccessor {
  @HostBinding('class.ngm-member-list') _isMemberListComponent = true
  @Input() dataSettings: DataSettings
  @Input() dimension: Dimension
  @Input() options: ControlOptions
  @Input() appearance: NgmAppearance

  searchControl = new FormControl()
  
  get displayBehaviour() {
    return this.dimension?.displayBehaviour
  }
  get multiple() {
    return this.options?.selectionType === FilterSelectionType.Multiple
  }

  private slicer$ = new BehaviorSubject<ISlicer>(null)
  get members() {
    return this.slicer$.value?.members
  }
  set members(value) {
    let members = value
    if (this.searchControl.value) {
      if (this.multiple) {
        // append
        members = this.members ?? []
        value.forEach((item) => {
          if (!members.find((member) => member.value === item.value)) {
            members.push(item)
          }
        })
      }
    }
    const slicer = this.slicer$.value ?? {}
    slicer.members = members
    this.slicer$.next(slicer)

  }

  public readonly loading$ = this.smartFilterService.loading$
  public readonly selectOptions$ = this.searchControl.valueChanges.pipe(
    map((text) => (text ? `${text}`.toLowerCase() : text)),
    startWith(null),
    combineLatestWith(
      this.smartFilterService.selectResult().pipe(
        map((result) => result.data?.map((item) => ({
          value: item.memberKey,
          label: item.memberCaption
        })))
      )
    ),
    map(
      ([text, selectOptions]) =>
        (text
          ? selectOptions?.filter(
              (option) => option.label?.toLowerCase().includes(text) || `${option.value}`.toLowerCase().includes(text)
            )
          : selectOptions) ?? []
    )
  )

  onChange: (input: any) => void
  constructor(private smartFilterService: NgmSmartFilterService) {}

  ngOnInit() {
    this.smartFilterService
      .onAfterServiceInit()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.smartFilterService.refresh()
      })

    this.slicer$.pipe(untilDestroyed(this)).subscribe((slicer) => {
      this.onChange?.({
        ...slicer,
        dimension: this.dimension
      })
    })
  }
  
  ngOnChanges({ dataSettings, dimension, options }: SimpleChanges): void {
    if (dataSettings?.currentValue) {
      this.smartFilterService.dataSettings = dataSettings.currentValue
    }
    if (dimension?.currentValue) {
      this.smartFilterService.options = { ...this.options, dimension: dimension.currentValue }
    }
    if (options?.currentValue) {
      this.smartFilterService.options = { ...options.currentValue, dimension: this.dimension }
    }
  }

  writeValue(obj: any): void {
    if (obj) {
      this.slicer$.next({ ...obj })
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

  compareWith(a, b) {
    return a.value === b.value
  }
}
