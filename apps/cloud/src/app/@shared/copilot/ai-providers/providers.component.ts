import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, model, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatTooltipModule } from '@angular/material/tooltip'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NgmSpinComponent } from '@metad/ocap-angular/common'
import { getErrorMessage, injectAiProviders, ToastrService } from '../../../@core'
import {Dialog, DialogRef, DIALOG_DATA, DialogModule} from '@angular/cdk/dialog';
import { NgmI18nPipe } from '@metad/ocap-angular/core'

@Component({
  standalone: true,
  selector: 'copilot-ai-providers-dialog',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TranslateModule, CdkMenuModule, MatTooltipModule, MatInputModule, NgmI18nPipe, NgmSpinComponent]
})
export class CopilotAiProvidersComponent {
  readonly #dialogRef = inject(DialogRef)
  readonly #translate = inject(TranslateService)
  readonly #toastr = inject(ToastrService)
  readonly aiProviders = injectAiProviders()


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
}
