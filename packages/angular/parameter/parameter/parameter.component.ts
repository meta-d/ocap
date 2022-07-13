import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { NgmAppearance, NgmDSCoreService } from '@metad/ocap-angular/core'
import { DataSettings, FilterSelectionType, IMember, ParameterControlEnum, ParameterProperty } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import isEqual from 'lodash/isEqual'
import pick from 'lodash/pick'
import { BehaviorSubject, combineLatestWith, distinctUntilChanged, filter, map, of, switchMap } from 'rxjs'

export interface ParameterOptions {
  selectionType: FilterSelectionType
}

@UntilDestroy()
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-parameter',
  templateUrl: 'parameter.component.html',
  styleUrls: ['parameter.component.scss'],
  host: {
    'class': 'ngm-parameter'
  }
})
export class ParameterComponent implements OnChanges {
  ParameterControlEnum = ParameterControlEnum

  @Input() get dataSettings(): DataSettings {
    return this.dataSettings$.value
  }
  set dataSettings(value) {
    this.dataSettings$.next(value)
  }
  private dataSettings$ = new BehaviorSubject<DataSettings>(null)

  @Input() get parameter(): ParameterProperty {
    return this.parameter$.value
  }
  set parameter(value) {
    this.parameter$.next(value)
  }
  private parameter$ = new BehaviorSubject<ParameterProperty>(null)

  @Input() options: ParameterOptions
  @Input() appearance: NgmAppearance

  @Output() parameterChange = new EventEmitter<ParameterProperty>()

  get multiple() {
    return this.options?.selectionType === FilterSelectionType.Multiple
  }
  get paramType() {
    return this.parameter?.paramType
  }
  get availableMembers() {
    return this.parameter?.availableMembers ?? []
  }
  get members() {
    return this.parameter.members
  }
  set members(members) {
    this.parameter = {
      ...this.parameter,
      members
    }
    this.changeParameter()
  }

  inputControl = new FormControl()

  private readonly dataSource$ = this.dataSettings$.pipe(
    map((dataSettings) => dataSettings?.dataSource),
    filter((value) => !!value),
    distinctUntilChanged(),
    switchMap((dataSource) => this.dsCoreService.getDataSource(dataSource))
  )
  public readonly members$ = this.parameter$.pipe(
    filter((value) => !!value?.dimension),
    map((parameter) => pick(parameter, ['dimension', 'hierarchy'])),
    distinctUntilChanged(isEqual),
    combineLatestWith(
      this.dataSettings$.pipe(
        map((dataSettings) => dataSettings?.entitySet),
        filter((value) => !!value),
        distinctUntilChanged()
      ),
      this.dataSource$
    ),
    switchMap(([parameter, entity, dataSource]) => {
      return dataSource.discoverMDMembers(entity, parameter)
    }),
    map((members) =>
      members?.map((item) => ({
        value: item.memberKey,
        label: item.memberCaption
      }))
    )
  )

  public readonly availableMembers$ = this.parameter$.pipe(
    map((parameter) => parameter?.availableMembers),
    distinctUntilChanged(),
    switchMap((availableMembers) => (availableMembers?.length ? of(availableMembers) : this.members$))
  )

  constructor(private dsCoreService: NgmDSCoreService) {
    this.inputControl.valueChanges.pipe(distinctUntilChanged(), untilDestroyed(this)).subscribe((value) => {
      this.parameter = {
        ...this.parameter,
        value
      }
      this.changeParameter()
    })
  }

  ngOnChanges({ parameter }: SimpleChanges): void {
    if (parameter) {
      this.inputControl.setValue(parameter.currentValue?.value)
    }
  }

  compareWith(a: IMember, b: IMember) {
    return a.value === b.value
  }

  updateParameterValue(event) {
    this.parameter = {
      ...this.parameter,
      value: event
    }
    this.changeParameter()
  }

  changeParameter() {
    this.parameterChange.emit(this.parameter)
  }
}
