import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { distinctUntilChanged } from 'rxjs'
import { CopilotService, getErrorMessage, ToastrService } from '../../../@core'
import { TranslationBaseComponent } from '../../../@shared'

@Component({
  selector: 'pac-settings-copilot',
  templateUrl: './copilot.component.html',
  styleUrls: ['./copilot.component.scss']
})
export class CopilotComponent extends TranslationBaseComponent {
  private readonly copilotService = inject(CopilotService)
  private readonly _cdr = inject(ChangeDetectorRef)
  private readonly _toastrService = inject(ToastrService)

  formGroup = new FormGroup({
    id: new FormControl(null),
    enabled: new FormControl(null),
    provider: new FormControl('openai', [Validators.required]),
    apiKey: new FormControl(null, [Validators.required]),
    apiHost: new FormControl(null)
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
    .valueChanges.pipe(distinctUntilChanged())
    .subscribe((enabled) => {
      if (enabled) {
        this.formGroup.get('provider').enable()
        this.formGroup.get('apiKey').enable()
        this.formGroup.get('apiHost').enable()
      } else {
        this.formGroup.get('provider').disable()
        this.formGroup.get('apiKey').disable()
        this.formGroup.get('apiHost').disable()
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
