import { Component, computed, inject } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AiProviderRole } from '@metad/contracts'
import { NgmDensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import {
  getErrorMessage,
  injectCopilots,
  injectCopilotServer,
  injectToastr,
  PACCopilotService
} from 'apps/cloud/src/app/@core'
import { MaterialModule, TranslationBaseComponent } from '../../../../@shared'
import { CopilotFormComponent } from '../copilot-form/copilot-form.component'

@Component({
  standalone: true,
  selector: 'pac-settings-copilot-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss'],
  imports: [
    TranslateModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgmDensityDirective,
    CopilotFormComponent
  ]
})
export class CopilotBasicComponent extends TranslationBaseComponent {
  eAiProviderRole = AiProviderRole
  readonly copilotService = inject(PACCopilotService)
  readonly copilotServer = injectCopilotServer()
  readonly copilots = injectCopilots()
  readonly #toastr = injectToastr()

  readonly primary = computed(() => this.copilots()?.find((_) => _.role === AiProviderRole.Primary))
  readonly secondary = computed(() => this.copilots()?.find((_) => _.role === AiProviderRole.Secondary))
  readonly embedding = computed(() => this.copilots()?.find((_) => _.role === AiProviderRole.Embedding))

  onToggle(role: AiProviderRole, current: boolean) {
    ;(current ? this.copilotServer.disableCopilot(role) : this.copilotServer.enableCopilot(role)).subscribe({
      next: () => {
        this.copilotServer.refresh()
      },
      error: (err) => {
        this.#toastr.error(getErrorMessage(err))
      }
    })
  }
}
