import { AsyncPipe } from '@angular/common'
import { Component, computed, effect, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { AI_PROVIDERS, AiModelCapability, AiProviderRole, isNil } from '@metad/copilot'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { DisplayBehaviour } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { upperFirst } from 'lodash-es'
import { startWith } from 'rxjs'
import {
  IKnowledgebase,
  KnowledgebasePermission,
  KnowledgebaseService,
  PACCopilotService,
  Store,
  ToastrService,
  getErrorMessage,
  routeAnimations
} from '../../../../../@core'
import { AvatarEditorComponent, MaterialModule, TranslationBaseComponent } from '../../../../../@shared'
import { KnowledgebaseComponent } from '../knowledgebase.component'

@Component({
  standalone: true,
  selector: 'pac-settings-knowledgebase-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
  imports: [
    AsyncPipe,
    RouterModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    NgmCommonModule,
    AvatarEditorComponent
  ],
  animations: [routeAnimations]
})
export class KnowledgeConfigurationComponent extends TranslationBaseComponent {
  KnowledgebasePermission = KnowledgebasePermission
  DisplayBehaviour = DisplayBehaviour

  readonly knowledgebaseService = inject(KnowledgebaseService)
  readonly _toastrService = inject(ToastrService)
  readonly #store = inject(Store)
  readonly #router = inject(Router)
  readonly #route = inject(ActivatedRoute)
  readonly knowledgebaseComponent = inject(KnowledgebaseComponent)
  readonly copilotService = inject(PACCopilotService)

  readonly organizationId = toSignal(this.#store.selectOrganizationId())
  readonly knowledgebase = this.knowledgebaseComponent.knowledgebase

  readonly formGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    avatar: new FormControl(null),
    language: new FormControl(null, [Validators.required]),
    permission: new FormControl<KnowledgebasePermission>(null),
    copilotId: new FormControl(null),
    embeddingModelId: new FormControl(null),

    parserConfig: new FormGroup({
      embeddingBatchSize: new FormControl(null),
      chunkSize: new FormControl(null),
      chunkOverlap: new FormControl(null)
    }),

    similarityThreshold: new FormControl(null)
  })

  readonly copilots = computed(() =>
    this.copilotService.copilots()?.filter((item) => item.enabled && item.organizationId === this.organizationId())
  )
  readonly copilotOptions = computed(() =>
    this.copilots()?.map((copilot) => {
      const provider = AI_PROVIDERS[copilot.provider]
      const roleName = upperFirst(copilot.role || AiProviderRole.Primary)
      return {
        key: copilot.id,
        caption:
          this.getTranslation('PAC.Copilot.Provider_' + provider?.caption, { Default: provider?.caption }) +
          `(${this.getTranslation('PAC.KEY_WORDS.' + roleName, { Default: roleName })})`
      }
    })
  )

  readonly copilotId = toSignal(
    this.formGroup.get('copilotId').valueChanges.pipe(startWith(this.formGroup.value.copilotId))
  )

  readonly copilot = computed(() => this.copilots()?.find((item) => item.id === this.copilotId()))
  readonly provider = computed(() => this.copilot()?.provider)

  readonly models = computed(() => {
    const copilot = this.copilot()
    const models = AI_PROVIDERS[this.copilot()?.provider]?.models || []
    const items = []
    if (copilot) {
      items.push({
        key: copilot.defaultModel,
        caption: models.find((_) => _.id === copilot.defaultModel)?.name
      })
      items.push(
        ...models
          .filter(
            (_) =>
              _.id !== copilot.defaultModel &&
              (isNil(_.capabilities) || _.capabilities.includes(AiModelCapability.Embed))
          )
          .map((item) => ({
            key: item.id,
            caption: item.name
          }))
      )
    }
    return items
  })

  readonly loading = signal(false)

  constructor() {
    super()

    effect(
      () => {
        const knowledgebase = this.knowledgebase()
        if (knowledgebase && this.formGroup.pristine) {
          this.formGroup.patchValue(knowledgebase)
        }
      },
      { allowSignalWrites: true }
    )

    effect(
      () => {
        if (this.loading()) {
          this.formGroup.disable()
        } else {
          this.formGroup.enable()
        }
      },
      { allowSignalWrites: true }
    )
  }

  save() {
    this.loading.set(true)
    this.knowledgebaseService
      .update(this.knowledgebase().id, { ...this.formGroup.value } as Partial<IKnowledgebase>)
      .subscribe({
        next: () => {
          this.formGroup.markAsPristine()
          this.loading.set(false)
          this._toastrService.success('PAC.Messages.SavedSuccessfully', { Default: 'Saved successfully' })
          this.knowledgebaseComponent.refresh()
        },
        error: (error) => {
          this._toastrService.error(getErrorMessage(error))
          this.loading.set(false)
        }
      })
  }

  cancel() {
    this.#router.navigate(['../..'], { relativeTo: this.#route })
  }
}
