import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatTooltipModule } from '@angular/material/tooltip'
import { TranslateModule } from '@ngx-translate/core'
import { MatDialogRef } from '@angular/material/dialog'
import { injectPromptGenerator } from './agent'

@Component({
  selector: 'copilot-prompt-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TranslateModule, CdkMenuModule, MatTooltipModule, MatInputModule]
})
export class CopilotPromptGeneratorComponent {
  readonly #dialogRef = inject(MatDialogRef)

  readonly promptGenerator = injectPromptGenerator()

  readonly instructions = model<string>('')

  readonly prompt = signal<string>('')

  readonly promptLength = computed(() => this.prompt().length)

  async generate() {
    const result = await this.promptGenerator().invoke({
      TASK_DESCRIPTION: this.instructions()
    })

    this.prompt.set(result.content as string)
  }

  cancel() {
    this.#dialogRef.close()
  }
}
