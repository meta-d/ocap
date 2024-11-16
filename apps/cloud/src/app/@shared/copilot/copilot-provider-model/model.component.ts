import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatTooltipModule } from '@angular/material/tooltip'
import { NgmSpinComponent } from '@metad/ocap-angular/common'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { getErrorMessage, ICopilotProvider, ICopilotProviderModel, injectAiProviders, injectCopilotProviderService, ToastrService } from '../../../@core'
import { derivedAsync } from 'ngxtension/derived-async'
import { DIALOG_DATA } from '@angular/cdk/dialog'
import { DialogRef } from '@angular/cdk/dialog'
import { CopilotCredentialFormComponent } from '../credential-form/form.component'

@Component({
  standalone: true,
  selector: 'copilot-provider-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    DragDropModule,
    MatTooltipModule,
    MatInputModule,
    NgmI18nPipe,

    CopilotCredentialFormComponent
  ],
  host: {
  }
})
export class CopilotProviderModelComponent {
  readonly #dialogRef = inject(DialogRef)
  readonly #data = inject<{provider: ICopilotProvider; modelId: string;}>(DIALOG_DATA)
  readonly #translate = inject(TranslateService)
  readonly #toastr = inject(ToastrService)
  readonly #copilotProviderService = injectCopilotProviderService()

  // Inputs
  readonly copilotProvider = signal(this.#data.provider)
  readonly modelId = signal(this.#data.modelId)

  // Outputs
  readonly deleted = output<void>()

  readonly model = derivedAsync(() => {
    return this.modelId() ? this.#copilotProviderService.getModel(this.copilotProvider().id, this.modelId()) : null
  })

  readonly model_credential_schema = computed(() => this.copilotProvider().provider?.model_credential_schema)
  readonly credential_form_schemas = computed(() => this.model_credential_schema()?.credential_form_schemas)

  readonly label = computed(() => this.copilotProvider()?.provider?.label)
  readonly icon = computed(() => this.copilotProvider()?.provider?.icon_large)

  readonly loading = signal(false)

  constructor() {
    effect(() => {
      console.log(this.model_credential_schema(), this.model())
    })
  }
}
