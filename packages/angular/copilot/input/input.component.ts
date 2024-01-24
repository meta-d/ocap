import { NgFor, NgIf } from '@angular/common'
import { Component, signal } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips'
import { MatTooltipModule } from '@angular/material/tooltip'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  standalone: true,
  selector: 'ngm-copilot-input',
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  imports: [NgIf, NgFor, TranslateModule, ReactiveFormsModule, MatTooltipModule, MatChipsModule, MatAutocompleteModule]
})
export class NgmCopilotInputComponent {
  answering = signal(false)
  suggesting = signal(false)
  error = ''
  promptControl = new FormControl('')

  suggestedPrompts = signal([])

  /**
   * Add an ask prompt
   *
   * @param event
   */
  async add(event: MatChipInputEvent) {
    // Prompt value
    const value = (event.value || '').trim()

    // Clear the input value
    event.chipInput!.clear()
    this.promptControl.setValue(null)

    if (value) {
      //   await this.askCopilot(value)
    }
  }

  selected(event: MatAutocompleteSelectedEvent) {
    // this.promptInput.nativeElement.value = event.option.viewValue
    this.promptControl.setValue(event.option.viewValue)
  }
}
