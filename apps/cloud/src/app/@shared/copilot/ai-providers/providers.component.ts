import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, model, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatTooltipModule } from '@angular/material/tooltip'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NgmSpinComponent } from '@metad/ocap-angular/common'
import { getErrorMessage, IAiProviderEntity, ICopilot, injectAiProviders, injectCopilotProviderService, ToastrService } from '../../../@core'
import {Dialog, DialogRef, DIALOG_DATA, DialogModule} from '@angular/cdk/dialog';
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { CopilotAiProviderAuthComponent } from './authorization/authorization.component'
import { DragDropModule } from '@angular/cdk/drag-drop'


@Component({
  standalone: true,
  selector: 'copilot-ai-providers-dialog',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TranslateModule, DragDropModule, MatTooltipModule, MatInputModule, NgmI18nPipe, NgmSpinComponent]
})
export class CopilotAiProvidersComponent {
  readonly #dialogRef = inject(DialogRef)
  readonly #dialog = inject(Dialog)
  readonly #data = inject<{copilot: ICopilot}>(DIALOG_DATA)
  readonly #translate = inject(TranslateService)
  readonly #toastr = inject(ToastrService)
  readonly #copilotProviderService = injectCopilotProviderService()
  readonly aiProviders = injectAiProviders()

  readonly copilot = signal(this.#data.copilot)


  readonly loading = signal(false)

  constructor() {
    effect(() => {
        console.log(this.aiProviders())
    })
  }

  cancel() {
    this.#dialogRef.close()
  }

  apply() {
  }

  openSetup(provider: IAiProviderEntity) {
    this.#dialog.open(CopilotAiProviderAuthComponent, {
      data: {
        provider: provider,
        copilot: this.copilot()
      }
    }).closed.subscribe({
      next: (copilotProvider) => {
        if (copilotProvider) {
          this.#dialogRef.close(copilotProvider)
        }
      },
      error: (err) => {
        
      }
    })
  }

  addProvider(provider: IAiProviderEntity) {
    this.loading.set(true)
    this.#copilotProviderService.create({
      copilotId: this.copilot().id,
      providerName: provider.provider,
    }).subscribe({
      next: (copilotProvider) => {
        this.loading.set(false)
        this.#toastr.success('PAC.Messages.CreatedSuccessfully', { Default: 'Created successfully' })
        this.#dialogRef.close(copilotProvider)
      },
      error: (err) => {
        this.loading.set(false)
        this.#toastr.error(getErrorMessage(err))
      }
    })
  }
}
