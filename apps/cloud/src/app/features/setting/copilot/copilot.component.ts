import { ChangeDetectorRef, Component, computed, inject } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { AI_PROVIDERS, AiProvider } from '@metad/copilot'
import { TranslateModule } from '@ngx-translate/core'
import { distinctUntilChanged, startWith } from 'rxjs'
import { PACCopilotService, ToastrService, getErrorMessage } from '../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-copilot',
  templateUrl: './copilot.component.html',
  styleUrls: ['./copilot.component.scss'],
  imports: [TranslateModule, MaterialModule, FormsModule, ReactiveFormsModule]
})
export class CopilotComponent extends TranslationBaseComponent {
  readonly copilotService = inject(PACCopilotService)
  readonly _cdr = inject(ChangeDetectorRef)
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

  private copilotSub = this.copilotService.copilot$.pipe(takeUntilDestroyed()).subscribe((copilot) => {
    if (copilot) {
      this.formGroup.patchValue(copilot)
    } else {
      this.formGroup.reset()
    }
  })

  async onSubmit() {
    try {
      await this.copilotService.upsertOne(this.formGroup.value)
      this.formGroup.markAsPristine()
      this._toastrService.success('PAC.ACTIONS.Save', { Default: 'Save' })

      this._cdr.detectChanges()
    } catch (err) {
      this._toastrService.error(getErrorMessage(err))
    }
  }
}
