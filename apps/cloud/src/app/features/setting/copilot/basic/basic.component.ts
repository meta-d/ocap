import { Component, computed, effect, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { AI_PROVIDERS, AiProvider } from '@metad/copilot'
import { TranslateModule } from '@ngx-translate/core'
import { distinctUntilChanged, startWith } from 'rxjs'
import { AiProviderRole, PACCopilotService, Store, ToastrService, getErrorMessage } from '../../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-copilot-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss'],
  imports: [TranslateModule, MaterialModule, FormsModule, ReactiveFormsModule]
})
export class CopilotBasicComponent extends TranslationBaseComponent {
  AiProvider = AiProvider
  readonly #store = inject(Store)
  readonly copilotService = inject(PACCopilotService)
  readonly _toastrService = inject(ToastrService)

  readonly formGroup = new FormGroup({
    id: new FormControl(null),
    enabled: new FormControl(null),
    provider: new FormControl(AiProvider.OpenAI, [Validators.required]),
    apiKey: new FormControl(null, [Validators.required]),
    apiHost: new FormControl(null),
    defaultModel: new FormControl<string>(null),

    showTokenizer: new FormControl(null),

    secondary: new FormGroup({
      id: new FormControl(null),
      enabled: new FormControl(null),
      provider: new FormControl(AiProvider.OpenAI),
      apiKey: new FormControl(null),
      apiHost: new FormControl(null),
      defaultModel: new FormControl<string>(null)
    })
  })

  get enSecondary() {
    return this.formGroup.get('secondary').get('enabled')!.value
  }

  providerHref = {
    openai: 'https://platform.openai.com/account/api-keys',
    azure: 'https://azure.microsoft.com/en-us/free/cognitive-services/',
    dashscope: 'https://help.aliyun.com/zh/dashscope/developer-reference/activate-dashscope-and-create-an-api-key',
    ollama: 'https://ollama.com/'
  }

  readonly provider = toSignal(this.formGroup.get('provider').valueChanges.pipe(startWith(AiProvider.OpenAI)))
  readonly secondaryProvider = toSignal(
    this.formGroup.get('secondary').get('provider').valueChanges.pipe(startWith(AiProvider.OpenAI))
  )
  readonly models = computed(() => AI_PROVIDERS[this.provider()]?.models || [])
  readonly secondaryModels = computed(() => AI_PROVIDERS[this.secondaryProvider()]?.models || [])
  readonly organizationId = toSignal(this.#store.selectOrganizationId())

  readonly saving = signal(false)

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effects)
  |--------------------------------------------------------------------------
  */
  private enabledSub = this.formGroup
    .get('enabled')
    .valueChanges.pipe(startWith(false), distinctUntilChanged())
    .subscribe((enabled) => {
      if (enabled) {
        this.formGroup.get('provider').enable()
        this.formGroup.get('apiKey').enable()
        this.formGroup.get('apiHost').enable()
        this.formGroup.get('defaultModel').enable()
        this.formGroup.get('showTokenizer').enable()
        this.formGroup.get('secondary').enable()
      } else {
        this.formGroup.get('provider').disable()
        this.formGroup.get('apiKey').disable()
        this.formGroup.get('apiHost').disable()
        this.formGroup.get('defaultModel').disable()
        this.formGroup.get('showTokenizer').disable()
        this.formGroup.get('secondary').disable()
      }
    })

  constructor() {
    super()

    effect(() => {
      const items = this.copilotService.copilots()?.filter((item) => item.organizationId === this.organizationId())
      this.formGroup.reset()
      if (items) {
        const primary = items.find(({ role }) => role === AiProviderRole.Primary)
        const secondary = items.find(({ role }) => role === AiProviderRole.Secondary)
        if (primary?.enabled) {
          this.formGroup.patchValue(primary)
        }
        if (secondary?.enabled) {
          this.formGroup.get('secondary').patchValue(secondary as any)
        }
      }
      this.formGroup.markAsPristine()
    })
  }

  /**
  |--------------------------------------------------------------------------
  | Methods
  |--------------------------------------------------------------------------
  */
  async onSubmit() {
    try {
      this.saving.set(true)
      await this.copilotService.upsertItems([
        await this._getValue(AiProviderRole.Primary, this.formGroup),
        await this._getValue(AiProviderRole.Secondary, this.formGroup.get('secondary') as FormGroup)
      ])
      this.formGroup.markAsPristine()
      this._toastrService.success('PAC.ACTIONS.Save', { Default: 'Save' })
    } catch (err) {
      this._toastrService.error(getErrorMessage(err))
    } finally {
      this.saving.set(false)
    }
  }

  async _getValue(role: AiProviderRole, form: FormGroup) {
    const { apiKey, secondary, ...rest } = form.value

    return form.get('apiKey').dirty
      ? {
          ...rest,
          role,
          apiKey: apiKey.trim()
        }
      : {
          ...rest,
          role
        }
  }
}
