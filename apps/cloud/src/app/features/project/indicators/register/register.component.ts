import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, HostListener, inject, OnDestroy, Optional, ViewChild } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { isNil } from '@metad/ocap-core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateModule } from '@ngx-translate/core'
import { convertIndicatorResult, Indicator, IndicatorsService } from '@metad/cloud/state'
import { ConfirmDeleteComponent } from '@metad/components/confirm'
import { IsNilPipe, nonBlank, nonNullable, saveAsYaml } from '@metad/core'
import { TranslationBaseComponent } from 'apps/cloud/src/app/@shared/language/translation-base.component'
import { NGXLogger } from 'ngx-logger'
import { EMPTY, firstValueFrom } from 'rxjs'
import { catchError, delay, distinctUntilChanged, filter, map, startWith, switchMap, tap } from 'rxjs/operators'
import { IIndicator, IndicatorType, ToastrService } from '../../../../@core/index'
import { MaterialModule, userLabel } from '../../../../@shared'
import { ProjectComponent } from '../../project.component'
import { exportIndicator } from '../../types'
import { IndicatorRegisterFormComponent } from '../register-form/register-form.component'
import { ProjectIndicatorsComponent } from '../indicators.component'

// AOA : array of array
type AOA = any[][]

@UntilDestroy()
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
  providers: []
})
export class IndicatorRegisterComponent extends TranslationBaseComponent implements OnDestroy {
  private projectComponent = inject(ProjectComponent)
  private indicatorsComponent? = inject(ProjectIndicatorsComponent, {optional: true})

  @ViewChild('register_form') registerForm: IndicatorRegisterFormComponent

  indicator: Indicator = {}

  loading = false

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
      if (id === 'new') {
        this.indicatorsComponent?.setCurrentLink({id: 'new'} as Indicator)
      }
    }),
    filter((id) => !isNil(id) && id !== 'new'),
    distinctUntilChanged(),
    switchMap((id) => {
      this.loading = true
      return this.indicatorsService.getById(id, ['createdBy']).pipe(
        tap(() => (this.loading = false)),
        catchError((err) => {
          this.loading = false
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

  get isDirty$() {
    return this.registerForm.isDirty
  }

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private queryMapSub = this._route.queryParams
    .pipe(
      startWith(this._route.snapshot.queryParams),
      map((queryParams) => queryParams['modelId']),
      filter(nonBlank)
    )
    .subscribe((id) => {
      this.indicator = {
        ...this.indicator,
        modelId: id
      }
      // this.formGroup.patchValue({
      //   modelId: id
      // })
    })
  private indicatorSub = this.indicator$.pipe(
      filter(nonNullable),
      tap((indicator) => {
        this._logger?.debug('indicator register page on indicator change', indicator)
        this.indicator = {
          ...this.indicator,
          ...indicator,
          createdByName: userLabel(indicator.createdBy)
        }
      }),
      delay(300)
    ).subscribe((indicator) => {
      this.registerForm.formGroup.markAsPristine()
      this.indicatorsComponent?.setCurrentLink(indicator)
    })
  constructor(
    private indicatorsService: IndicatorsService,
    private toastrService: ToastrService,
    private _route: ActivatedRoute,
    private _router: Router,
    private readonly _cdr: ChangeDetectorRef,
    private _dialog: MatDialog,
    @Optional()
    private _logger?: NGXLogger
  ) {
    super()
  }

  async onSubmit() {
    let indicator = {
      ...this.indicator,
      formula: this.indicator.type === IndicatorType.DERIVE ? this.indicator.formula : null,
      projectId: this.project.id ?? null
    }
    if (!indicator.id) {
      delete indicator.id
    }

    this.loading = true
    try {
      indicator = await firstValueFrom(this.indicatorsService.create(indicator))

      this.loading = false
      if (this.indicator.id) {
        this.toastrService.success('PAC.INDICATOR.REGISTER.SaveIndicator', { Default: 'Save Indicator' })
      } else {
        this.toastrService.success('PAC.INDICATOR.REGISTER.CreateIndicator', { Default: 'Create Indicator' })
        this.indicatorsComponent?.replaceNewIndicator(indicator)
      }

      await this.projectComponent.refreshIndicators()
    } catch (err) {
      this.loading = false
      this.toastrService.error(err, '', {})
      return
    }

    this.indicator = {
      ...this.indicator,
      id: indicator.id
    }
    this.registerForm.formGroup.markAsPristine()
    // this.formGroup.patchValue({ id: indicator.id })
    // this.formGroup.markAsPristine()
    this._cdr.detectChanges()

    if (this.type === 'copy') {
      this.type = 'edit'
      this._router.navigate(['../', indicator.id], { relativeTo: this._route })
    }
  }

  copy(indicator: IIndicator) {
    this.type = 'copy'
    this.indicator = {
      ...this.indicator,
      id: null
    }
    // this.formGroup.patchValue({ id: null })
  }

  async deleteIndicator() {
    const confirm = await firstValueFrom(
      this._dialog
        .open(ConfirmDeleteComponent, {
          data: {
            value: this.indicator.name
          }
        })
        .afterClosed()
    )
    if (confirm) {
      try {
        await firstValueFrom(this.indicatorsService.delete(this.indicator.id))
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
    saveAsYaml(`${indicatorTmplFileName}.yaml`, [exportIndicator(this.indicator)])
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
