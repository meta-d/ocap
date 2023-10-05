import { Component, OnInit, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute } from '@angular/router'
import { CountdownConfirmationComponent } from '@metad/components/confirm'
import { IFeature, IFeatureOrganization, IFeatureToggle } from '@metad/contracts'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { combineLatest, firstValueFrom, of } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators'
import { environment } from '../../../environments/environment'
import { FeatureService, FeatureStoreService, Store } from '../../@core/services'
import { TranslationBaseComponent } from '../language/translation-base.component'


@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'pac-feature-toggle',
  templateUrl: './feature-toggle.component.html',
  styleUrls: ['./feature-toggle.component.scss']
})
export class FeatureToggleComponent extends TranslationBaseComponent implements OnInit {
  private readonly _activatedRoute = inject(ActivatedRoute)
  private readonly _featureService = inject(FeatureService)
  private readonly _featureStoreService = inject(FeatureStoreService)
  private readonly _storeService = inject(Store)
  private readonly _matDialog = inject(MatDialog)

  loading = false
  featureToggles = []
  featureTogglesDefinitions: IFeatureToggle[] = []

  public readonly isOrganization$ = this._activatedRoute.data.pipe(
    startWith(this._activatedRoute.snapshot.data),
    map((data) => data?.isOrganization),
    distinctUntilChanged(),
    takeUntilDestroyed(),
    shareReplay(1)
  )
  public readonly organization$ = this._storeService.selectedOrganization$

  public readonly features$ = this._featureService.getParentFeatures(['children']).pipe(map(({ items }) => items))

  public readonly featureTenant$ = this._storeService.featureTenant$

  public readonly featureOrganizations$ = this.isOrganization$.pipe(
    switchMap((isOrganization) => (isOrganization ? this.organization$ : of(null))),
    switchMap((organization) => {
      const request = {}
      if (organization) {
        request['organizationId'] = organization.id
      }
      return this._featureStoreService.loadFeatureOrganizations(['feature'], request).pipe(map(({ items }) => items))
    }),
    takeUntilDestroyed(),
    shareReplay(1)
  )

  ngOnInit(): void {
    combineLatest([this.featureTenant$, this.featureOrganizations$])
      .pipe(withLatestFrom(combineLatest([this.isOrganization$, this.organization$])), untilDestroyed(this))
      .subscribe(([[featureTenant, featureOrganizations], [isOrganization, organization]]) => {
        if (isOrganization && organization) {
          this._storeService.featureOrganizations = featureOrganizations
        }

        let featureToggles = []
        if (isOrganization && organization) {
          featureToggles = [...featureOrganizations]
        }

        featureTenant.forEach((item) => {
          if (!featureToggles.find((toggle) => toggle.featureId === item.featureId)) {
            featureToggles.push(item)
          }
        })

        this.featureToggles = featureToggles

        this.loading = false
      })

    this._storeService.featureToggles$
      .pipe(
        tap((toggles) => (this.featureTogglesDefinitions = toggles)),
        untilDestroyed(this)
      )
      .subscribe()
  }

  getFeatures() {
    this._featureStoreService.loadFeatures(['children']).pipe(untilDestroyed(this)).subscribe()
  }

  async featureChanged(isEnabled: boolean, feature: IFeature) {
    const result = await firstValueFrom(
      this._matDialog
        .open(CountdownConfirmationComponent, {
          data: {
          	recordType: feature.description,
          	isEnabled: isEnabled
          },
        })
        .afterClosed()
    )

    if (result) {
      await this.emitFeatureToggle({ feature, isEnabled: !!isEnabled })
    } else {
      if (!environment.IS_ELECTRON) {
        window.location.reload()
      }
    }
  }

  async emitFeatureToggle({ feature, isEnabled }: { feature: IFeature; isEnabled: boolean }) {
    const isOrganization = await firstValueFrom(this.isOrganization$)
    const organization = await firstValueFrom(this.organization$)
    const { id: featureId } = feature
    const request = {
      featureId,
      isEnabled
    }
    if (organization && isOrganization) {
      const { id: organizationId } = organization
      request['organizationId'] = organizationId
    }
    await firstValueFrom(this._featureStoreService.changedFeature(request))
    if (!environment.IS_ELECTRON) {
      window.location.reload()
    }
  }

  enabledFeature(row: IFeature) {
    const featureOrganization = this.featureToggles.find(
      (featureOrganization: IFeatureOrganization) => featureOrganization.featureId === row.id
    )
    if (featureOrganization && featureOrganization.isEnabled === false) {
      return featureOrganization.isEnabled
    }

    const featureToggle = this.featureTogglesDefinitions.find((item: IFeatureToggle) => item.name == row.code)
    if (featureToggle) {
      return featureToggle.enabled
    }

    return true
  }
}
