import { CommonModule } from '@angular/common'
import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  model,
  OnDestroy,
  signal,
  viewChild
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { convertIndicatorResult, Indicator, IndicatorsService, Store } from '@metad/cloud/state'
import { IsDirty, IsNilPipe, nonBlank, nonNullable, saveAsYaml } from '@metad/core'
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
  isNil,
  TimeRangeType
} from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { EMPTY, firstValueFrom } from 'rxjs'
import {
  catchError,
  delay,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap
} from 'rxjs/operators'
import { IIndicator, IndicatorType, ToastrService } from '../../../../@core/index'
import { MaterialModule, TranslationBaseComponent, userLabel } from '../../../../@shared'
import { ProjectComponent } from '../../project.component'
import { exportIndicator } from '../../types'
import { ProjectIndicatorsComponent } from '../indicators.component'
import { IndicatorRegisterFormComponent } from '../register-form/register-form.component'

// AOA : array of array
type AOA = any[][]
const NewIndicatorCodePlaceholder = 'new'

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
  selector: 'pac-project-indicator-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class IndicatorRegisterComponent extends TranslationBaseComponent implements OnDestroy, IsDirty {
  PERIODS = PERIODS

  private projectComponent = inject(ProjectComponent)
  private indicatorsComponent? = inject(ProjectIndicatorsComponent, { optional: true })
  private indicatorsService = inject(IndicatorsService)
  readonly #store = inject(Store)
  private toastrService = inject(ToastrService)
  private _route = inject(ActivatedRoute)
  private _router = inject(Router)
  readonly _cdr = inject(ChangeDetectorRef)
  private _dialog = inject(MatDialog)
  private _logger? = inject(NGXLogger, { optional: true })

  readonly registerForm = viewChild<IndicatorRegisterFormComponent>('register_form')

  readonly indicatorModel = model<Indicator>({})

  readonly loading = signal(false)
  readonly projectSignal = this.projectComponent.projectSignal
  readonly type = signal<string>('')

  readonly dataSettings = computed(() => {
    const registerForm = this.registerForm()
    const dataSettings = registerForm?.dataSettings()
    const indicator = this.indicatorModel()
    const period = this.period()
    const timeGranularity = period?.granularity
    const entityType = registerForm?.entityType()
    if (!entityType) {
      return null
    }
    const calendar = getEntityCalendar(entityType, indicator.calendar, timeGranularity)
    if (!calendar) {
      return null
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
        } as DataSettings)
      : null
  })
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

  readonly preview = signal(false)

  // states
  public readonly certifications$ = this.projectComponent.project$.pipe(
    map((project) => project?.certifications?.map((item) => ({ value: item.id, label: item.name })) ?? [])
  )
  public readonly models$ = this.projectComponent.project$.pipe(map((project) => project?.models))

  public readonly indicator$ = this._route.paramMap.pipe(
    startWith(this._route.snapshot.paramMap),
    map((paramMap) => paramMap.get('id')),
    tap((id) => {
      if (id === NewIndicatorCodePlaceholder) {
        this.indicatorsComponent?.setCurrentLink({ id: NewIndicatorCodePlaceholder } as Indicator)
        this._router.getCurrentNavigation().extras.state
        this.indicatorModel.update((state) => ({
          ...state,
          ...(this._router.getCurrentNavigation().extras.state ?? {})
        }))
      }
    }),
    filter((id) => !isNil(id) && id !== NewIndicatorCodePlaceholder),
    distinctUntilChanged(),
    switchMap((id) => {
      this.loading.set(true)
      return this.indicatorsService.getById(id, ['createdBy']).pipe(
        tap(() => this.loading.set(false)),
        catchError((err) => {
          this.loading.set(false)
          if (err.status === 404) {
            this.toastrService.error('PAC.INDICATOR.REGISTER.IndicatorNotFound', '', { Default: 'Indicator not found' })
          } else {
            this.toastrService.error(err.error.message)
          }
          return EMPTY
        })
      )
    }),
    map(convertIndicatorResult),
    shareReplay(1)
  )

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private queryMapSub = this._route.queryParams
    .pipe(
      startWith(this._route.snapshot.queryParams),
      map((queryParams) => queryParams['modelId']),
      filter(nonBlank),
      takeUntilDestroyed()
    )
    .subscribe((id) => {
      this.indicatorModel.update((indicator) => ({
        ...indicator,
        modelId: id
      }))
    })

  private indicatorSub = this.indicator$
    .pipe(
      filter(nonNullable),
      tap((indicator) => {
        this._logger?.debug('indicator register page on indicator change', indicator)
        this.indicatorModel.update((state) => ({
          ...state,
          ...indicator,
          createdByName: userLabel(indicator.createdBy)
        }))
      }),
      delay(300),
      takeUntilDestroyed()
    )
    .subscribe((indicator) => {
      this.registerForm().formGroup.markAsPristine()
      this.indicatorsComponent?.setCurrentLink(indicator)
    })

  constructor() {
    super()
  }

  isDirty(): boolean {
    return this.registerForm().isDirty
  }

  togglePeriod(name: string) {
    this.previewPeriod.set(name)
  }

  togglePreview() {
    this.preview.update((state) => !state)
  }

  async onSubmit() {
    let indicator = {
      ...this.indicatorModel(),
      formula: this.indicatorModel().type === IndicatorType.DERIVE ? this.indicatorModel().formula : null,
      projectId: this.projectSignal().id ?? null
    }
    if (!indicator.id) {
      delete indicator.id
    }

    this.loading.set(true)
    try {
      indicator = await firstValueFrom(this.indicatorsService.create(indicator))

      this.loading.set(false)
      if (this.indicatorModel().id) {
        this.toastrService.success('PAC.INDICATOR.REGISTER.SaveIndicator', { Default: 'Save Indicator' })
      } else {
        this.toastrService.success('PAC.INDICATOR.REGISTER.CreateIndicator', { Default: 'Create Indicator' })
        this.indicatorsComponent?.replaceNewIndicator(indicator)
      }

      await this.projectComponent.refreshIndicators()
    } catch (err) {
      this.loading.set(false)
      this.toastrService.error(err, '', {})
      return
    }

    this.indicatorModel.update((state) => ({
      ...state,
      id: indicator.id
    }))
    this.registerForm().formGroup.markAsPristine()

    if (this.type() === 'copy') {
      this.type.set('edit')
      this._router.navigate(['../', indicator.id], { relativeTo: this._route })
    }
  }

  copy(indicator: IIndicator) {
    this.type.set('copy')

    this.indicatorModel.update((state) => ({
      ...state,
      id: null
    }))
  }

  async deleteIndicator() {
    const confirm = await firstValueFrom(
      this._dialog
        .open(NgmConfirmDeleteComponent, {
          data: {
            value: this.indicatorModel().name
          }
        })
        .afterClosed()
    )
    if (confirm) {
      try {
        await firstValueFrom(this.indicatorsService.delete(this.indicatorModel().id))
        this.toastrService.success('PAC.INDICATOR.REGISTER.DeleteIndicator', { Default: 'Delete Indicator' })

        await this.projectComponent.refreshIndicators()
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
    saveAsYaml(`${indicatorTmplFileName}.yaml`, [exportIndicator(this.indicatorModel())])
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      event.preventDefault()
      this.onSubmit()
    }
  }

  ngOnDestroy(): void {
    this.indicatorsComponent?.setCurrentLink(null)
  }
}
