import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, model, signal } from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatTooltipModule } from '@angular/material/tooltip'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NgmSpinComponent } from '@metad/ocap-angular/common'
import {Dialog, DialogRef, DIALOG_DATA, DialogModule} from '@angular/cdk/dialog';
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { CopilotProviderService, CredentialFormSchema, getErrorMessage, IAiProviderEntity, ICopilot, injectAiProviders, ToastrService } from '../../../../@core'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { CopilotCredentialFormComponent } from '../../credential-form/form.component'


@Component({
  standalone: true,
  selector: 'copilot-ai-provider-auth-dialog',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, CdkMenuModule, DragDropModule, MatTooltipModule, MatInputModule, NgmI18nPipe, NgmSpinComponent,
    CopilotCredentialFormComponent]
})
export class CopilotAiProviderAuthComponent {
  readonly #dialogRef = inject(DialogRef)
  readonly #data = inject<{provider: IAiProviderEntity; copilot: ICopilot;}>(DIALOG_DATA)
  readonly #copilotProviderService = inject(CopilotProviderService)
  readonly #translate = inject(TranslateService)
  readonly #toastr = inject(ToastrService)
  readonly #fb = inject(FormBuilder)
  readonly #i18n = new NgmI18nPipe()

  readonly provider = computed(() => this.#data.provider)
  readonly copilot = computed(() => this.#data.copilot)
  readonly icon = computed(() => this.#i18n.transform(this.provider()?.icon_large))
  readonly provider_credential_schema = computed(() => this.provider()?.provider_credential_schema)
  readonly credential_form_schemas = computed(() => this.provider_credential_schema()?.credential_form_schemas)

  readonly credentials = signal<CredentialFormSchema[]>([])

  readonly help = computed(() => this.provider()?.help)

  readonly loading = signal(false)

  readonly formGroup = this.#fb.group({})

  constructor() {
    effect(() => {
        console.log(this.provider())
        console.log(this.credential_form_schemas())

        if (this.credential_form_schemas()) {
          // Clear
          Object.keys(this.formGroup.controls).forEach(key => this.formGroup.removeControl(key))

          this.credential_form_schemas().forEach((credential) => {
            this.formGroup.addControl(credential.variable, this.#fb.control(null))
          })

          this.formGroup.markAsPristine()

          this.credentials.set(this.credential_form_schemas())
        }
    }, { allowSignalWrites: true })
  }

  cancel() {
    this.#dialogRef.close()
  }

  apply() {
    // console.log(this.copilot(), this.formGroup.value)
    this.loading.set(true)
    this.#copilotProviderService.create({
      copilotId: this.copilot().id,
      providerName: this.provider().provider,
      encryptedConfig: {
        ...this.formGroup.value
      }
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
