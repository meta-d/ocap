import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ThemePalette } from '@angular/material/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatRadioModule } from '@angular/material/radio'
import { MatSliderDragEvent, MatSliderModule } from '@angular/material/slider'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { ControlsModule } from '@metad/ocap-angular/controls'
import { NgmAppearance, NgmDSCoreService, OcapCoreModule } from '@metad/ocap-angular/core'
import {
  DataSettings,
  DisplayBehaviour,
  FilterSelectionType,
  IMember,
  ISlicer,
  ParameterControlEnum,
  ParameterProperty,
  isEqual,
  pick
} from '@metad/ocap-core'
import { BehaviorSubject, Subject, combineLatestWith, debounceTime, distinctUntilChanged, filter, map, of, switchMap } from 'rxjs'

export interface ParameterOptions {
  /**
   * Single or multiple selection of parameter's members
   */
  selectionType?: FilterSelectionType
  /**
   * Use slider component for number type input parameter
   */
  slider?: boolean
  // Attributes for slider component
  sliderStep?: number
  sliderMin?: number
  sliderMax?: number
  showThumbLabel?: boolean
  showTickMarks?: boolean
  sliderColor?: ThemePalette
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatListModule,
    MatSliderModule,

    OcapCoreModule,
    NgmCommonModule,
    ControlsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-parameter',
  templateUrl: 'parameter.component.html',
  styleUrls: ['parameter.component.scss'],
  host: {
    class: 'ngm-parameter'
  }
})
export class NgmParameterComponent implements OnChanges {
  ParameterControlEnum = ParameterControlEnum

  private dsCoreService = inject(NgmDSCoreService)

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

  @Input() displayBehaviour: DisplayBehaviour

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
    if (!isEqual(members, this.parameter.members)) {
      this.parameter = {
        ...this.parameter,
        members
      }
      this.changeParameter()
    }
  }

  private readonly dataSource$ = this.dataSettings$.pipe(
    map((dataSettings) => dataSettings?.dataSource),
    filter((value) => !!value),
    distinctUntilChanged(),
    switchMap((dataSource) => this.dsCoreService.getDataSource(dataSource))
  )
  public readonly dimension$ = this.parameter$.pipe(
    filter((value) => !!value?.dimension),
    map((parameter) => pick(parameter, 'dimension', 'hierarchy')),
    distinctUntilChanged(isEqual)
  )
  public readonly members$ = this.dimension$.pipe(
    combineLatestWith(
      this.dataSettings$.pipe(
        map((dataSettings) => dataSettings?.entitySet),
        filter((value) => !!value),
        distinctUntilChanged()
      ),
      this.dataSource$
    ),
    switchMap(([parameter, entity, dataSource]) => dataSource.discoverMDMembers(entity, parameter)),
    map((members) =>
      members?.map((item) => ({
        key: item.memberKey,
        value: item.memberKey,
        caption: item.memberCaption
      } as IMember))
    )
  )

  public readonly availableMembers$ = this.parameter$.pipe(
    map((parameter) => parameter?.availableMembers),
    distinctUntilChanged(),
    switchMap((availableMembers) => (availableMembers?.length ? of(availableMembers) : this.members$))
  )

  slicer = {}
  parameterValue = null

  private changeParameter$ = new Subject<void>()
  private changeSub = this.changeParameter$.pipe(
      debounceTime(500),
      takeUntilDestroyed()
    ).subscribe(() => this.parameterChange.emit(this.parameter))

  ngOnChanges({ parameter }: SimpleChanges): void {
    if (parameter) {
      this.parameterValue = parameter.currentValue?.value
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
    this.changeParameter$.next()
  }

  onSlicerChange(slicer: ISlicer) {
    this.updateParameterValue(slicer.members)
  }

  onSlicerEnd(event: MatSliderDragEvent) {
    this.updateParameterValue(event.value)
  }

  onBlur(event: FocusEvent) {
    this.updateParameterValue((<HTMLInputElement>event.target).value)
  }
}
