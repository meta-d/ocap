import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatTooltipModule } from '@angular/material/tooltip'
import { NgmSpinComponent } from '@metad/ocap-angular/common'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { getErrorMessage, ICopilotProvider, injectAiProviders, injectCopilotProviderService, ToastrService } from '../../../@core'
import { derivedAsync } from 'ngxtension/derived-async'
import { Dialog } from '@angular/cdk/dialog'
import { CopilotProviderModelComponent } from '../copilot-provider-model/model.component'

@Component({
  standalone: true,
  selector: 'copilot-provider',
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    DragDropModule,
    MatTooltipModule,
    MatInputModule,
    NgmI18nPipe,
    NgmSpinComponent
  ],
  host: {
    '[style.background]': 'background()'
  }
})
export class CopilotProviderComponent {
  readonly #dialog = inject(Dialog)
  readonly #translate = inject(TranslateService)
  readonly #toastr = inject(ToastrService)
  readonly #copilotProviderService = injectCopilotProviderService()
  readonly aiProviders = injectAiProviders()

  // Inputs
  readonly providerId = input<string>()

  // Outputs
  readonly deleted = output<void>()

  readonly copilotProvider = derivedAsync(() => {
    return this.providerId() ? this.#copilotProviderService.getOneById(this.providerId(), { relations: ['models']}) : null
  })

  readonly background = computed(() => this.copilotProvider()?.provider?.background ?? 'red')
  readonly icon = computed(() => this.copilotProvider()?.provider?.icon_large)
  readonly models = computed(() => this.copilotProvider()?.models ?? [])

  readonly loading = signal(false)

  constructor() {
    effect(() => {
      console.log(this.copilotProvider())
    })
  }

  delete() {
    this.loading.set(true)
    this.#copilotProviderService.delete(this.providerId()).subscribe({
      next: (copilotProvider) => {
        this.loading.set(false)
        this.#toastr.success('PAC.Messages.DeletedSuccessfully', { Default: 'Deleted successfully' })
        this.deleted.emit()
      },
      error: (err) => {
        this.loading.set(false)
        this.#toastr.error(getErrorMessage(err))
      }
    })
  }

  addModel() {
    this.#dialog.open(CopilotProviderModelComponent, {
      data: {
        provider: this.copilotProvider(),
        modelId: null
      }
    }).closed.subscribe({
      
    })
  }
}
