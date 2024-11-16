import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatTooltipModule } from '@angular/material/tooltip'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { CredentialFormSchema } from '../../../@core'

@Component({
  standalone: true,
  selector: 'copilot-credential-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CdkMenuModule,
    DragDropModule,
    MatTooltipModule,
    MatInputModule,
    NgmI18nPipe,
  ]
})
export class CopilotCredentialFormComponent {
  readonly #translate = inject(TranslateService)
  readonly #fb = inject(FormBuilder)
  readonly #i18n = new NgmI18nPipe()

  readonly credentialFormSchemas = input<CredentialFormSchema[]>()

  readonly formGroup = this.#fb.group({})

  readonly credentials = signal<CredentialFormSchema[]>([])

  constructor() {
    effect(
      () => {
        if (this.credentialFormSchemas()) {
          // Clear
          Object.keys(this.formGroup.controls).forEach((key) => this.formGroup.removeControl(key))

          this.credentialFormSchemas().forEach((credential) => {
            this.formGroup.addControl(credential.variable, this.#fb.control(null))
          })

          this.formGroup.markAsPristine()

          this.credentials.set(this.credentialFormSchemas())
        }
      },
      { allowSignalWrites: true }
    )
  }
}
