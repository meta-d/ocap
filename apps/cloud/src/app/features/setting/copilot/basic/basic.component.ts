import { Component, computed, effect, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { AI_PROVIDERS, AiProvider } from '@metad/copilot'
import { TranslateModule } from '@ngx-translate/core'
import { distinctUntilChanged, startWith } from 'rxjs'
import { PACCopilotService, ToastrService, getErrorMessage } from '../../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-copilot-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss'],
  imports: [TranslateModule, MaterialModule, FormsModule, ReactiveFormsModule]
})
export class CopilotBasicComponent extends TranslationBaseComponent {
  readonly copilotService = inject(PACCopilotService)
  readonly _toastrService = inject(ToastrService)

  formGroup = new FormGroup({
    id: new FormControl(null),
    enabled: new FormControl(null),
    provider: new FormControl(AiProvider.OpenAI, [Validators.required]),
    apiKey: new FormControl(null, [Validators.required]),
    apiHost: new FormControl(null),
    defaultModel: new FormControl<string>(null),

    showTokenizer: new FormControl(null)
  })

  providerHref = {
    openai: 'https://platform.openai.com/account/api-keys',
    azure: 'https://azure.microsoft.com/en-us/free/cognitive-services/',
    dashscope: 'https://help.aliyun.com/zh/dashscope/developer-reference/activate-dashscope-and-create-an-api-key'
  }

  readonly provider = toSignal(this.formGroup.get('provider').valueChanges.pipe(startWith(AiProvider.OpenAI)))
  readonly models = computed(() => AI_PROVIDERS[this.provider()]?.models || [])

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
      } else {
        this.formGroup.get('provider').disable()
        this.formGroup.get('apiKey').disable()
        this.formGroup.get('apiHost').disable()
        this.formGroup.get('defaultModel').disable()
        this.formGroup.get('showTokenizer').disable()
      }
    })

  constructor() {
    super()

    effect(() => {
      const copilot = this.copilotService.copilotConfig()
      this.formGroup.reset()
      if (copilot?.enabled) {
        this.formGroup.patchValue(copilot)
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
      const { apiKey, ...rest } = this.formGroup.value
      await this.copilotService.upsertOne(
        this.formGroup.get('apiKey').dirty
          ? {
              ...rest,
              apiKey: apiKey.trim()
            }
          : rest
      )
      this.formGroup.markAsPristine()
      this._toastrService.success('PAC.ACTIONS.Save', { Default: 'Save' })
    } catch (err) {
      this._toastrService.error(getErrorMessage(err))
    } finally {
      this.saving.set(false)
    }
  }
}
