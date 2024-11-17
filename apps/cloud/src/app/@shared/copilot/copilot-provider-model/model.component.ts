import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  model,
  output,
  signal,
  viewChild
} from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatTooltipModule } from '@angular/material/tooltip'
import { KebabToCamelCasePipe } from '@metad/core'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { derivedAsync } from 'ngxtension/derived-async'
import { AiModelTypeEnum, getErrorMessage, ICopilotProvider, injectCopilotProviderService, ToastrService } from '../../../@core'
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
    ReactiveFormsModule,
    TranslateModule,
    DragDropModule,
    CdkListboxModule,
    MatTooltipModule,
    MatInputModule,
    NgmI18nPipe,
    KebabToCamelCasePipe,

    CopilotCredentialFormComponent
  ],
  host: {}
})
export class CopilotProviderModelComponent {
  readonly #dialogRef = inject(DialogRef)
  readonly #data = inject<{ provider: ICopilotProvider; modelId: string }>(DIALOG_DATA)
  readonly #translate = inject(TranslateService)
  readonly #toastr = inject(ToastrService)
  readonly #copilotProviderService = injectCopilotProviderService()

  // Inputs
  readonly copilotProvider = signal(this.#data.provider)
  readonly modelId = signal(this.#data.modelId)

  // Outputs
  readonly deleted = output<void>()

  // ViewChild
  readonly credentialForm = viewChild('credentialForm', { read: CopilotCredentialFormComponent })

  readonly model = derivedAsync(() => {
    return this.modelId() ? this.#copilotProviderService.getModel(this.copilotProvider().id, this.modelId()) : null
  })

  readonly model_credential_schema = computed(() => this.copilotProvider().provider?.model_credential_schema)
  readonly supported_model_types = computed(() => this.copilotProvider().provider?.supported_model_types)
  readonly credential_form_schemas = computed(() => this.model_credential_schema()?.credential_form_schemas)
  readonly modelSchema = computed(() => this.model_credential_schema()?.model)

  readonly label = computed(() => this.copilotProvider()?.provider?.label)
  readonly icon = computed(() => this.copilotProvider()?.provider?.icon_large)
  readonly help = computed(() => this.copilotProvider()?.provider?.help)

  readonly loading = signal(false)

  // models
  readonly credentials = model({})
  readonly modelTypes = model<AiModelTypeEnum[]>(null)
  readonly modelName = model<string>()

  get invalid() {
    return this.credentialForm().invalid || !this.modelTypes()?.[0] || !this.modelName()
  }

  constructor() {
    effect(() => {
      if (!this.modelTypes() && this.supported_model_types()) {
        this.modelTypes.set([this.supported_model_types()[0]])
      }
    }, { allowSignalWrites: true })

    effect(() => {
      if (this.model()) {
        this.modelName.set(this.model().modelName)
        this.modelTypes.set([this.model().modelType])
        this.credentials.set(this.model().encryptedConfig)

      }
    }, { allowSignalWrites: true })
  }

  delete() {
    this.loading.set(true)
    this.#copilotProviderService.deleteModel(this.copilotProvider().id, this.modelId()).subscribe({
      next: (deleteResult) => {
        this.loading.set(false)
        this.#toastr.success('PAC.Messages.DeletedSuccessfully', { Default: 'Deleted successfully' })
        this.#dialogRef.close(deleteResult)
      },
      error: (err) => {
        this.loading.set(false)
        this.#toastr.error(getErrorMessage(err))
      }
    })
  }

  apply() {
    if (this.modelId()) {
      return this.updateModel()
    }
    this.loading.set(true)
    this.#copilotProviderService.createModel(this.copilotProvider().id, {
      modelType: this.modelTypes()[0],
      modelName: this.modelName(),
      encryptedConfig: this.credentials()
    }).subscribe({
      next: (providerModel) => {
        this.loading.set(false)
        this.#toastr.success('PAC.Messages.CreatedSuccessfully', { Default: 'Created successfully' })
        this.#dialogRef.close(providerModel)
      },
      error: (err) => {
        this.loading.set(false)
        this.#toastr.error(getErrorMessage(err))
      }
    })
  }

  updateModel() {
    this.loading.set(true)
    this.#copilotProviderService.updateModel(this.copilotProvider().id, this.modelId(), {
      modelType: this.modelTypes()[0],
      modelName: this.modelName(),
      encryptedConfig: this.credentials()
    }).subscribe({
      next: (providerModel) => {
        this.loading.set(false)
        this.#toastr.success('PAC.Messages.UpdatedSuccessfully', { Default: 'Updated successfully' })
        this.#dialogRef.close(providerModel)
      },
      error: (err) => {
        this.loading.set(false)
        this.#toastr.error(getErrorMessage(err))
      }
    })
  }

  close() {
    this.#dialogRef.close()
  }
}
