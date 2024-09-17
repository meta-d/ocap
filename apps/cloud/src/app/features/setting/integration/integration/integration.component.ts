import { AsyncPipe } from '@angular/common'
import { Component, computed, effect, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmInputComponent, NgmSelectComponent } from '@metad/ocap-angular/common'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'
import { ContentLoaderModule } from '@ngneat/content-loader'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule } from '@ngx-translate/core'
import { environment } from 'apps/cloud/src/environments/environment'
import { derivedFrom } from 'ngxtension/derived-from'
import { injectParams } from 'ngxtension/inject-params'
import { BehaviorSubject, EMPTY, map, pipe, startWith, switchMap } from 'rxjs'
import {
  convertConfigurationSchema,
  INTEGRATION_PROVIDERS,
  IntegrationEnum,
  IntegrationService,
  routeAnimations,
  Store,
  ToastrService
} from '../../../../@core'
import { MaterialModule } from '../../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss'],
  imports: [
    AsyncPipe,
    RouterModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    ContentLoaderModule,
    MaterialModule,
    AppearanceDirective,
    DensityDirective,
    NgmSelectComponent,
    NgmInputComponent
  ],
  animations: [routeAnimations]
})
export class IntegrationComponent {
  DisplayBehaviour = DisplayBehaviour

  readonly integrationService = inject(IntegrationService)
  readonly #toastr = inject(ToastrService)
  readonly #store = inject(Store)
  readonly #router = inject(Router)
  readonly #route = inject(ActivatedRoute)
  readonly #dialog = inject(MatDialog)
  readonly paramId = injectParams('id')

  readonly organizationId$ = this.#store.selectOrganizationId()

  readonly refresh$ = new BehaviorSubject<boolean>(true)

  readonly providers = signal([
    {
      key: IntegrationEnum.LARK,
      caption: 'Lark'
    }
  ])

  readonly formGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl(null),
    slug: new FormControl(null),
    provider: new FormControl(null),
    options: new FormGroup({})
  })

  get options() {
    return this.formGroup.get('options') as FormGroup
  }

  readonly provider = this.formGroup.get('provider')
  readonly integrationProvider = toSignal(
    this.provider.valueChanges.pipe(
      startWith(this.provider.value),
      map((provider) => INTEGRATION_PROVIDERS[provider])
    )
  )

  readonly schema = computed(() =>
    this.integrationProvider() ? convertConfigurationSchema(this.integrationProvider().schema, {}) : null
  )

  readonly integration = derivedFrom(
    [this.paramId],
    pipe(switchMap(([id]) => (id ? this.integrationService.getById(id) : EMPTY))),
    {
      initialValue: null
    }
  )

  readonly loading = signal(true)

  readonly webhookUrl = computed(() =>
    this.integrationProvider()?.webhookUrl(this.integration(), environment.API_BASE_URL)
  )

  constructor() {
    effect(
      () => {
        if (this.integration()) {
          this.formGroup.patchValue(this.integration())
        } else {
          this.formGroup.reset()
        }
        this.formGroup.markAsPristine()
        this.loading.set(false)
      },
      { allowSignalWrites: true }
    )
  }

  refresh() {
    this.refresh$.next(true)
  }

  upsert() {
    ;(this.formGroup.value.id
      ? this.integrationService.create({
          ...this.formGroup.value
        })
      : this.integrationService.update(this.formGroup.value.id, {
          ...this.formGroup.value
        })
    ).subscribe({
      next: () => {
        this.#toastr.success('Integration created')
        this.#router.navigate(['..'], { relativeTo: this.#route })
      }
    })
  }
}
