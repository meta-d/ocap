import { ChangeDetectorRef, Component, inject } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { distinctUntilChanged, startWith } from 'rxjs'
import { getErrorMessage, ToastrService } from '../../../@core'
import { TranslationBaseComponent } from '../../../@shared'
import { PACCopilotService } from '../../../@core'

@Component({
  selector: 'pac-settings-copilot',
  templateUrl: './copilot.component.html',
  styleUrls: ['./copilot.component.scss']
})
export class CopilotComponent extends TranslationBaseComponent {
  readonly copilotService = inject(PACCopilotService)
  readonly _cdr = inject(ChangeDetectorRef)
  readonly _toastrService = inject(ToastrService)

  formGroup = new FormGroup({
    id: new FormControl(null),
    enabled: new FormControl(null),
    provider: new FormControl('openai', [Validators.required]),
    apiKey: new FormControl(null, [Validators.required]),
    apiHost: new FormControl(null),

    showTokenizer: new FormControl(null),
  })
  get provider() {
    return this.formGroup.get('provider').value
  }

  providerHref = {
    openai: 'https://platform.openai.com/account/api-keys',
    azure: 'https://azure.microsoft.com/en-us/free/cognitive-services/'
  }

  private enabledSub = this.formGroup
    .get('enabled')
    .valueChanges.pipe(startWith(false), distinctUntilChanged())
    .subscribe((enabled) => {
      if (enabled) {
        this.formGroup.get('provider').enable()
        this.formGroup.get('apiKey').enable()
        this.formGroup.get('apiHost').enable()
        this.formGroup.get('showTokenizer').enable()
      } else {
        this.formGroup.get('provider').disable()
        this.formGroup.get('apiKey').disable()
        this.formGroup.get('apiHost').disable()
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
