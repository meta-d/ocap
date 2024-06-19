import { TextFieldModule } from '@angular/cdk/text-field'
import { CommonModule } from '@angular/common'
import { Component, computed, inject, model, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatInputModule } from '@angular/material/input'
import { CopilotEngine } from '@metad/copilot'
import { NgmCopilotEngineService } from '../services'

@Component({
  standalone: true,
  selector: 'ngm-copilot-command-dialog',
  templateUrl: './command-dialog.component.html',
  styleUrls: ['./command-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatInputModule,
    TextFieldModule
  ]
})
export class CommandDialogComponent {
  readonly #copilotEngine: CopilotEngine = inject(NgmCopilotEngineService)

  readonly data = inject<{ commands: string[] }>(MAT_DIALOG_DATA)
  readonly dialogRef = inject(MatDialogRef)

  readonly commandName = model<string>(this.data.commands[0])

  readonly command = computed(() => {
    const command = this.commandName()
    return this.#copilotEngine.commands().find((item) => item.name === command)
  })

  readonly prompt = model<string>('')
  readonly creating = signal(false)
  readonly error = signal('')

  #abortController: AbortController

  async execute() {
    const prompt = this.prompt()
    this.#abortController = new AbortController()
    this.creating.set(true)
    try {
      const message = await this.#copilotEngine.chat(prompt, {
        command: this.commandName(),
        abortController: this.#abortController
      })
      this.dialogRef.close(message)
    } catch (err: any) {
      console.error(err)
      this.error.set(err.message)
    } finally {
      this.creating.set(false)
    }
  }
}
