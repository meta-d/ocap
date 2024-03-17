import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, HostListener, inject, model, OnDestroy, signal, ViewChild } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { isNil } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { convertIndicatorResult, Indicator, IndicatorsService } from '@metad/cloud/state'
import { ConfirmDeleteComponent } from '@metad/components/confirm'
import { IsDirty, IsNilPipe, nonBlank, nonNullable, saveAsYaml } from '@metad/core'
import { NGXLogger } from 'ngx-logger'
import { EMPTY, firstValueFrom } from 'rxjs'
import { catchError, delay, distinctUntilChanged, filter, map, startWith, switchMap, tap } from 'rxjs/operators'
import { IIndicator, IndicatorType, ToastrService } from '../../../../@core/index'
import { MaterialModule, userLabel, TranslationBaseComponent } from '../../../../@shared'
import { ProjectComponent } from '../../project.component'
import { exportIndicator } from '../../types'
import { IndicatorRegisterFormComponent } from '../register-form/register-form.component'
import { ProjectIndicatorsComponent } from '../indicators.component'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

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
    IndicatorRegisterFormComponent
  ],
  selector: 'pac-project-indicator-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class IndicatorRegisterComponent extends TranslationBaseComponent implements OnDestroy, IsDirty {
  private projectComponent = inject(ProjectComponent)
  private indicatorsComponent? = inject(ProjectIndicatorsComponent, {optional: true})
  private indicatorsService = inject(IndicatorsService)
  private toastrService = inject(ToastrService)
  private _route = inject(ActivatedRoute)
  private _router = inject(Router)
  readonly _cdr = inject(ChangeDetectorRef)
  private _dialog = inject(MatDialog)
  private _logger? = inject(NGXLogger, {optional: true})

  @ViewChild('register_form') registerForm: IndicatorRegisterFormComponent

  // indicator: Indicator = {}
  readonly indicatorModel = model<Indicator>({})

  readonly loading = signal(false)

  get project() {
    return this.projectComponent.project
  }

  // states
  public readonly certifications$ = this.projectComponent.project$.pipe(
    map((project) => project?.certifications?.map((item) => ({ value: item.id, label: item.name })) ?? [])
  )
  public readonly models$ = this.projectComponent.project$.pipe(map((project) => project?.models))

  type: string

  public readonly indicator$ = this._route.paramMap.pipe(
    startWith(this._route.snapshot.paramMap),
    map((paramMap) => paramMap.get('id')),
    tap((id) => {
      if (id === NewIndicatorCodePlaceholder) {
        this.indicatorsComponent?.setCurrentLink({id: NewIndicatorCodePlaceholder} as Indicator)
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
        tap(() => (this.loading.set(false))),
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
    map(convertIndicatorResult)
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

  private indicatorSub = this.indicator$.pipe(
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
    ).subscribe((indicator) => {
      this.registerForm.formGroup.markAsPristine()
      this.indicatorsComponent?.setCurrentLink(indicator)
    })

  isDirty(): boolean {
    return this.registerForm.isDirty
  }

  async onSubmit() {
    let indicator = {
      ...this.indicatorModel(),
      formula: this.indicatorModel().type === IndicatorType.DERIVE ? this.indicatorModel().formula : null,
      projectId: this.project.id ?? null
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
    this.registerForm.formGroup.markAsPristine()
    // this._cdr.detectChanges()

    if (this.type === 'copy') {
      this.type = 'edit'
      this._router.navigate(['../', indicator.id], { relativeTo: this._route })
    }
  }

  copy(indicator: IIndicator) {
    this.type = 'copy'

    this.indicatorModel.update((state) => ({
      ...state,
      id: null
    }))
  }

  async deleteIndicator() {
    const confirm = await firstValueFrom(
      this._dialog
        .open(ConfirmDeleteComponent, {
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
