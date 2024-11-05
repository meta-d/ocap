import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatDialogRef } from '@angular/material/dialog'
import { MatInputModule } from '@angular/material/input'
import { MatTooltipModule } from '@angular/material/tooltip'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NgmSpinComponent } from '@metad/ocap-angular/common'
import { injectPromptGenerator, PRESET_INSTRUCTIONS } from './agent'
import { getErrorMessage, ToastrService } from '../../../@core'

@Component({
  standalone: true,
  selector: 'copilot-prompt-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TranslateModule, CdkMenuModule, MatTooltipModule, MatInputModule, NgmSpinComponent]
})
export class CopilotPromptGeneratorComponent {
  readonly #dialogRef = inject(MatDialogRef)
  readonly #translate = inject(TranslateService)
  readonly #toastr = inject(ToastrService)
  readonly PRESET_INSTRUCTIONS = PRESET_INSTRUCTIONS

  readonly promptGenerator = injectPromptGenerator()

  readonly instructions = model<string>('')

  readonly prompt = signal<string>('')

  readonly promptLength = computed(() => this.prompt().length)

  readonly loading = signal(false)

  async generate() {
    this.loading.set(true)
    try {
      const result = await this.promptGenerator().invoke({
        TASK_DESCRIPTION: this.instructions()
      })
  
      this.prompt.set(result.content as string)
    } catch(err) {
      this.#toastr.error(getErrorMessage(err))
    } finally {
      this.loading.set(false)
    }
  }

  presetInstruction(name: string) {
    const item = PRESET_INSTRUCTIONS.find((_) => _.key === name)
    this.instructions.set(
      this.#translate.instant(`PAC.Copilot.PromptGenerator.${item.key}.instruction`, { Default: item.instruction })
    )
  }

  cancel() {
    this.#dialogRef.close()
  }

  apply() {
    this.#dialogRef.close(this.prompt())
  }
}
