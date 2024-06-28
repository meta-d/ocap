import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
  viewChild
} from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { convertIndicatorResult, Indicator, IndicatorsService, Store } from '@metad/cloud/state'
import { createSubStore, dirtyCheckWith, IsDirty, IsNilPipe, nonBlank, saveAsYaml } from '@metad/core'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { NgmCommonModule, NgmConfirmDeleteComponent } from '@metad/ocap-angular/common'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective, PERIODS } from '@metad/ocap-angular/core'
import {
  C_MEASURES,
  calcRange,
  ChartDimensionRoleType,
  DataSettings,
  FilterOperator,
  getEntityCalendar,
  IFilter,
  isEqual,
  negate,
  TimeRangeType
} from '@metad/ocap-core'
import { withProps } from '@ngneat/elf'
import { TranslateModule } from '@ngx-translate/core'
import { cloneDeep } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { injectParams } from 'ngxtension/inject-params'
import { EMPTY, firstValueFrom } from 'rxjs'
import { catchError, delayWhen, distinctUntilChanged, filter, map, startWith, tap } from 'rxjs/operators'
import { IIndicator, isUUID, ToastrService } from '../../../../@core/index'
import { MaterialModule, TranslationBaseComponent } from '../../../../@shared'
import { ProjectService } from '../../project.service'
import { exportIndicator, NewIndicatorCodePlaceholder } from '../../types'
import { ProjectIndicatorsComponent } from '../indicators.component'
import { IndicatorRegisterFormComponent } from '../register-form/register-form.component'

// AOA : array of array
type AOA = any[][]

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    IsNilPipe,

    ButtonGroupDirective,
    DensityDirective,
    AppearanceDirective,
    NgmCommonModule,
    AnalyticalCardModule,
    IndicatorRegisterFormComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-project-indicator-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class IndicatorRegisterComponent extends TranslationBaseComponent implements OnDestroy, IsDirty {
  PERIODS = PERIODS

  private projectService = inject(ProjectService)
  private indicatorsComponent? = inject(ProjectIndicatorsComponent, { optional: true })
  private indicatorsService = inject(IndicatorsService)
  readonly #store = inject(Store)
  private toastrService = inject(ToastrService)
  private _route = inject(ActivatedRoute)
  private _router = inject(Router)
  private _dialog = inject(MatDialog)
  private _logger? = inject(NGXLogger, { optional: true })

  readonly registerForm = viewChild<IndicatorRegisterFormComponent>('register_form')
  readonly contentElement = viewChild<ElementRef>('content')

  readonly store = createSubStore(
    this.projectService.iStore,
    { name: 'project_indicator', arrayKey: 'id' },
    withProps<Indicator>(null)
  )
  readonly pristineStore = createSubStore(
    this.projectService.iPristineStore,
    { name: 'project_indicator_pristine', arrayKey: 'id' },
    withProps<Indicator>(null)
  )
  readonly dirtyCheckResult = dirtyCheckWith(this.store, this.pristineStore, { comparator: negate(isEqual) })
  readonly dirty = this.dirtyCheckResult.dirty

  readonly indicator = toSignal(this.store.pipe(distinctUntilChanged(isEqual)))

  readonly loading = signal(false)
  readonly projectSignal = this.projectService.project
  readonly type = signal<string>('')

  readonly dataSettings = computed(() => {
    const registerForm = this.registerForm()
    const dataSettings = registerForm?.dataSettings()
    const indicator = this.indicator()
    const period = this.period()
    const timeGranularity = period?.granularity
    const entityType = registerForm?.entityType()
    if (!entityType) {
      return null
    }
    const calendar = getEntityCalendar(entityType, indicator.calendar, timeGranularity)
    if (!calendar) {
      return {
        error: this.translateService.instant(`PAC.INDICATOR.REGISTER.CalendarDimensionNotSet`, {
          Default: 'Calendar dimension not set'
        })
      } as undefined as DataSettings & { error?: string }
    }
    const { dimension, hierarchy, level } = calendar

    const timeRange = calcRange(new Date(), {
      type: TimeRangeType.Standard,
      granularity: timeGranularity,
      formatter: level?.semantics?.formatter,
      lookBack: period?.lookBack
    })

    const timeSlicer = {
      dimension: {
        dimension: dimension.name,
        hierarchy: hierarchy.name
      },
      members: timeRange.map((value) => ({ value })),
      operator: FilterOperator.BT
    } as IFilter

    return dataSettings && calendar
      ? ({
          ...dataSettings,
          chartAnnotation: {
            chartType: {
              type: 'Line'
            },
            dimensions: [
              {
                dimension: dimension.name,
                hierarchy: hierarchy.name,
                level: level.name,
                role: ChartDimensionRoleType.Time,
                chartOptions: {
                  dataZoom: {
                    type: 'inside'
                  }
                }
              }
            ],
            measures: [
              {
                dimension: C_MEASURES,
                measure: indicator.code,
                formatting: {
                  shortNumber: true,
                  unit: indicator.unit
                }
              }
            ]
          },
          selectionVariant: {
            selectOptions: [timeSlicer, ...(indicator.filters ?? [])]
          }
        } as DataSettings & { error?: string })
      : null
  })
  readonly error = computed(() => this.dataSettings()?.error)
  readonly previewPeriod = signal('1Y')
  readonly period = computed(() => this.PERIODS.find((item) => item.name === this.previewPeriod()))
  readonly primaryTheme$ = toSignal(this.#store.primaryTheme$)

  readonly chartOptions = signal({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      position: (pos, params, el, elRect, size) => {
        const obj = {}
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 60
        obj[['top', 'bottom'][+(pos[1] < size.viewSize[1] / 2)]] = 20
        return obj
      }
    }
  })

  readonly preview = signal(true)

  // states
  public readonly certifications$ = this.projectService.project$.pipe(
    map((project) => project?.certifications?.map((item) => ({ value: item.id, label: item.name })) ?? [])
  )
  readonly models = this.projectService.models

  readonly paramId = injectParams('id')

  readonly initialized = signal(false)
  readonly initialized$ = toObservable(this.initialized)

  private queryMapSub = this._route.queryParams
    .pipe(
      startWith(this._route.snapshot.queryParams),
      map((queryParams) => queryParams['modelId']),
      filter(nonBlank),
      delayWhen(() => this.initialized$.pipe(filter((initialized) => initialized))),
      takeUntilDestroyed()
    )
    .subscribe((id) => {
      this.onModelChange({ modelId: id })
    })
  private paramIdSub = toObservable(this.paramId)
    .pipe(
      tap((id) => {
        if (id === NewIndicatorCodePlaceholder) {
          this.projectService.newIndicator()
        }
      })
    )
    .subscribe((id) => {
      this.init(id)
    })

  constructor() {
    super()

    effect(
      () => {
        if (this.indicator()?.id) {
          this.projectService.markDirty(this.indicator()?.id, this.dirty())
        }
      },
      { allowSignalWrites: true }
    )
  }

  public init(id: string) {
    const state = this.store.connect(['indicators', id]).getValue()
    this.pristineStore.connect(['indicators', id])
    if (!state.code && !state.id) {
      if (isUUID(id)) {
        this.loading.set(true)
        this.projectService
          .getIndicatorById(id)
          .pipe(
            tap(() => this.loading.set(false)),
            catchError((err) => {
              this.loading.set(false)
              if (err.status === 404) {
                this.toastrService.error('PAC.INDICATOR.REGISTER.IndicatorNotFound', '', {
                  Default: 'Indicator not found'
                })
              } else {
                this.toastrService.error(err.error.message)
              }
              this._router.navigate(['../404'], { relativeTo: this._route })
              return EMPTY
            }),
            map(convertIndicatorResult)
          )
          .subscribe((indicator) => {
            this.registerForm().formGroup.markAsPristine()
            this.indicatorsComponent?.setCurrentLink({ ...indicator, id: indicator.id ?? indicator.code })
            this.store.update(() => indicator)
            this.pristineStore.update(() => cloneDeep(indicator))
            this.initialized.set(true)
          })
      } else {
        this._router.navigate(['../404'], { relativeTo: this._route })
      }
    } else {
      this.initialized.set(true)
      this.indicatorsComponent?.setCurrentLink({ ...state, id: state.id ?? state.code })
    }
  }

  isDirty(): boolean {
    return this.registerForm().isDirty
  }

  togglePeriod(name: string) {
    this.previewPeriod.set(name)
  }

  togglePreview() {
    this.preview.update((state) => !state)
    if (this.preview()) {
      setTimeout(() => {
        this.scrollToBottom()
      }, 300)
    }
  }

  onModelChange(event: Indicator) {
    if (this.initialized()) {
      this.store.update((state) => ({ ...state, ...event }))
    }
  }

  async onSubmit() {
    // let indicator = {
    //   ...this.indicator(),
    //   measure: this.indicator().type === IndicatorType.BASIC ? this.indicator().measure : null,
    //   formula: this.indicator().type === IndicatorType.DERIVE ? this.indicator().formula : null,
    //   projectId: this.projectSignal().id ?? null
    // }
    // if (!isUUID(indicator.id)) {
    //   delete indicator.id
    // }

    this.loading.set(true)
    try {
      const indicator = await this.indicatorsComponent.saveIndicator(this.indicator())

      this.loading.set(false)

      if (this.type() === 'copy') {
        this.type.set('edit')
        this._router.navigate(['../', indicator.id], { relativeTo: this._route })
      }

      // if (isUUID(this.indicator().id)) {
      //   this.toastrService.success('PAC.INDICATOR.REGISTER.SaveIndicator', { Default: 'Save Indicator' })
      // } else {
      //   this.toastrService.success('PAC.INDICATOR.REGISTER.CreateIndicator', { Default: 'Create Indicator' })
      //   this.projectService.replaceNewIndicator(this.indicator().id, indicator)
      //   this.indicatorsComponent?.replaceNewIndicator(this.indicator().id, indicator)
      // }

      // this.projectService.refreshIndicators()
    } catch (err) {
      this.loading.set(false)
      this.toastrService.error(err, '', {})
    }
  }

  copy(indicator: IIndicator) {
    this.type.set('copy')

    this.store.update((state) => ({
      ...state,
      id: null
    }))
  }

  async deleteIndicator() {
    const confirm = await firstValueFrom(
      this._dialog
        .open(NgmConfirmDeleteComponent, {
          data: {
            value: this.indicator().name
          }
        })
        .afterClosed()
    )
    if (confirm) {
      try {
        await firstValueFrom(this.indicatorsService.delete(this.indicator().id))
        this.toastrService.success('PAC.INDICATOR.REGISTER.DeleteIndicator', { Default: 'Delete Indicator' })

        this.projectService.refreshIndicators()
        this._router.navigate(['../../indicators'], { relativeTo: this._route })
      } catch (err) {
        this.toastrService.error(err, '', {})
      }
    }
  }

  /**
   * 下载指标上传模板
   */
  async downloadTempl() {
    const indicatorTmplFileName = await firstValueFrom(
      this.translateService.get('PAC.INDICATOR.IndicatorTemplateFileName', { Default: 'IndicatorTemplate' })
    )
    saveAsYaml(`${indicatorTmplFileName}.yaml`, [exportIndicator(this.indicator())])
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      event.preventDefault()
      this.onSubmit()
    }
  }

  private scrollToBottom(): void {
    try {
      this.contentElement().nativeElement.scrollTop = this.contentElement().nativeElement.scrollHeight
    } catch (err) {}
  }

  ngOnDestroy(): void {
    this.indicatorsComponent?.setCurrentLink(null)
  }
}
