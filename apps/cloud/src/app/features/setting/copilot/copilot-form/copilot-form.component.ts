import { DecimalPipe } from '@angular/common'
import { booleanAttribute, Component, computed, effect, inject, input, model, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { AiProviderRole } from '@metad/contracts'
import { AI_PROVIDERS, AiProvider, isNil } from '@metad/copilot'
import { TranslateModule } from '@ngx-translate/core'
import { startWith } from 'rxjs/operators'
import { getErrorMessage, PACCopilotService, Store, ToastrService } from '../../../../@core'
import { MaterialModule } from '../../../../@shared'

const PROVIDERS = [
  {
    name: AiProvider.OpenAI,
    icon: 'openai.svg',
    iconAlt: 'openai-logo',
    embedding: true
  },
  {
    name: AiProvider.Azure,
    icon: 'azure.svg',
    iconAlt: 'azure-logo',
    embedding: true
  },
  {
    name: AiProvider.Ollama,
    icon: 'ollama.svg',
    iconAlt: 'ollama-logo',
    embedding: true
  },
  {
    name: AiProvider.DeepSeek,
    icon: 'deepseek.svg',
    iconAlt: 'deepseek-logo',
    embedding: false
  },
  {
    name: AiProvider.Anthropic,
    icon: 'claude.svg',
    iconAlt: 'claude-logo',
    embedding: false
  },
  {
    name: AiProvider.AlibabaTongyi,
    icon: 'tongyi.svg',
    iconAlt: 'tongyi-logo',
    embedding: true
  },
  {
    name: AiProvider.Zhipu,
    icon: 'zhipu.svg',
    iconAlt: 'zhipu-logo',
    embedding: true
  },
  // {
  //   name: AiProvider.BaiduQianfan,
  //   icon: 'qianfan.svg',
  //   iconAlt: 'qianfan-logo',
  //   embedding: true
  // }
  {
    name: AiProvider.Together,
    icon: 'together-ai.svg',
    iconAlt: 'together-logo',
    embedding: true
  },
  {
    name: AiProvider.Moonshot,
    icon: 'moonshot.svg',
    iconAlt: 'moonshot-logo',
    embedding: false
  },
  {
    name: AiProvider.Groq,
    icon: 'groq.svg',
    iconAlt: 'groq-logo',
    embedding: false
  },
  {
    name: AiProvider.Mistral,
    icon: 'mistral.svg',
    iconAlt: 'mistral-logo',
    embedding: true
  },
  {
    name: AiProvider.Cohere,
    icon: 'cohere.svg',
    iconAlt: 'cohere-logo',
    embedding: true
  },
]

@Component({
  standalone: true,
  selector: 'pac-copilot-form',
  templateUrl: './copilot-form.component.html',
  styleUrls: ['./copilot-form.component.scss'],
  imports: [DecimalPipe, TranslateModule, MaterialModule, FormsModule, ReactiveFormsModule]
})
export class CopilotFormComponent {
  AiProvider = AiProvider

  readonly #store = inject(Store)
  readonly copilotService = inject(PACCopilotService)
  readonly #toastrService = inject(ToastrService)

  readonly role = input<AiProviderRole>()

  readonly enabled = model<boolean>(false)
  readonly embedding = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  readonly formGroup = new FormGroup({
    id: new FormControl(null),
    enabled: new FormControl(false),
    provider: new FormControl(AiProvider.OpenAI, [Validators.required]),
    apiKey: new FormControl(null),
    apiHost: new FormControl(null),
    defaultModel: new FormControl<string | null>(null),

    showTokenizer: new FormControl(null),
    tokenBalance: new FormControl(null)
  }, {})

  get tokenBalance() {
    return this.formGroup.get('tokenBalance').value
  }

  readonly providers = computed(() =>
    (this.embedding() ? PROVIDERS.filter((p) => p.embedding) : PROVIDERS).map((provider) => ({
      ...provider,
      caption: AI_PROVIDERS[provider.name].caption
    }))
  )
  readonly provider = toSignal(this.formGroup.get('provider').valueChanges.pipe(startWith(AiProvider.OpenAI)))
  readonly models = computed(() => {
    const models = AI_PROVIDERS[this.provider()]?.models || []
    return this.embedding() ? models.filter((_) => isNil(_.embed) || _.embed) : models.filter((_) => !_.embed)
  })
  readonly providerHomepage = computed(() => AI_PROVIDERS[this.provider()]?.homepage || '')
  readonly providerInfo = computed(() => this.providers().find((item) => item.name === this.provider()))

  readonly saving = signal(false)

  readonly organizationId = toSignal(this.#store.selectOrganizationId())
  readonly copilot = computed(() =>
    this.copilotService
      .copilots()
      ?.find((item) => item.organizationId === this.organizationId() && item.role === this.role())
  )

  constructor() {
    effect(() => {
      if (this.enabled()) {
        this.formGroup.enable()
      } else {
        this.formGroup.disable()
      }
    })

    effect(
      () => {
        if (this.copilot()) {
          this.enabled.set(this.copilot().enabled)
          this.formGroup.patchValue(this.copilot())
          this.formGroup.markAsPristine()
        }
      },
      { allowSignalWrites: true }
    )
  }

  async onSubmit() {
    if (!this.formGroup.value.id && !this.enabled()) {
      return
    }
    try {
      this.saving.set(true)
      await this.copilotService.upsertItems([
        this.enabled()
          ? { ...this._getValue(this.formGroup), role: this.role(), enabled: true }
          : {
              id: this.formGroup.value.id,
              enabled: false
            }
      ])
      this.formGroup.markAsPristine()
      this.#toastrService.success('PAC.ACTIONS.Save', { Default: 'Save' })
    } catch (err) {
      this.#toastrService.error(getErrorMessage(err))
    } finally {
      this.saving.set(false)
    }
  }

  _getValue(form: FormGroup) {
    const { apiKey, secondary, ...rest } = form.value

    return form.get('apiKey').dirty
      ? {
          ...rest,
          apiKey: apiKey.trim()
        }
      : {
          ...rest
        }
  }

  formatBalanceLabel(value: number): string {
    if (value >= 1000000) {
      return Math.round(value / 1000000) + 'm'
    }
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k'
    }

    return `${value}`
  }

  cancel() {
    if (this.copilot()) {
      this.formGroup.patchValue(this.copilot())
    } else {
      this.formGroup.reset()
    }
    this.formGroup.markAsPristine()
  }
}
