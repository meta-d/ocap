import { DecimalPipe } from '@angular/common'
import { booleanAttribute, Component, computed, effect, inject, input, model, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { AiProviderRole } from '@metad/contracts'
import { AI_PROVIDERS, AiProvider } from '@metad/copilot'
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
    embedding: true
  },
  {
    name: AiProvider.AlibabaTongyi,
    icon: 'tongyi.svg',
    iconAlt: 'tongyi-logo',
    embedding: true
  }
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

  providerHref = {
    openai: 'https://platform.openai.com/account/api-keys',
    azure: 'https://azure.microsoft.com/en-us/free/cognitive-services/',
    dashscope: 'https://help.aliyun.com/zh/dashscope/developer-reference/activate-dashscope-and-create-an-api-key',
    ollama: 'https://ollama.com/',
    [AiProvider.Anthropic]: 'https://www.anthropic.com/api'
  }

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
    enabled: new FormControl(null),
    provider: new FormControl(AiProvider.OpenAI, [Validators.required]),
    apiKey: new FormControl(null),
    apiHost: new FormControl(null),
    defaultModel: new FormControl<string | null>(null),

    showTokenizer: new FormControl(null),
    tokenBalance: new FormControl(null)
  })

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
  readonly models = computed(() => AI_PROVIDERS[this.provider()]?.models || [])
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
}
