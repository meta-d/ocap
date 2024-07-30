import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'
import { NgmDisplayBehaviourComponent, NgmSearchComponent } from '@metad/ocap-angular/common'
import { DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { ChatbiService } from '../chatbi.service'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatButtonModule } from '@angular/material/button'
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatInputModule } from '@angular/material/input'
import { BehaviorSubject, delay } from 'rxjs'
import { toSignal } from '@angular/core/rxjs-interop'
import { NgmCopilotEngineService } from '@metad/copilot-angular'
import { NGXLogger } from 'ngx-logger'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RouterModule,
    TranslateModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatInputModule,
    DensityDirective,
    NgmSearchComponent,
    NgmDisplayBehaviourComponent
  ],
  selector: 'pac-chatbi-input',
  templateUrl: 'input.component.html',
  styleUrl: 'input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatbiInputComponent {
  readonly chatbiService = inject(ChatbiService)
  readonly #copilotEngine = inject(NgmCopilotEngineService)
  readonly #logger = inject(NGXLogger)

  readonly cube = this.chatbiService.cube

  readonly prompts = signal([])
  readonly prompt = model<string>('')
  readonly answering = signal(false)
  readonly conversation = this.chatbiService.conversation

  readonly copilotConversation = computed(() => this.#copilotEngine.conversation())
  readonly abortController = computed(() => this.copilotConversation()?.abortController)

  readonly suggestionsOpened$ = new BehaviorSubject(false)
  readonly #suggestionsOpened = toSignal(this.suggestionsOpened$.pipe(delay(100)), { initialValue: false })

  newChat() {
    this.chatbiService.newConversation()
  }

  async ask() {
    const prompt = this.prompt().trim()
    try {
      this.answering.set(true)
      this.prompt.set('')
      this.chatbiService.addHumanMessage(prompt)
      if (!this.conversation().command) {
        this.conversation.update((state) => ({...state, command: 'insight'}))
        await this.#copilotEngine.chat(`/insight ${prompt}`, {})
      } else {
        await this.#copilotEngine.chat(prompt, {})
      }
    } catch (err) {
      this.#logger.error(err)
    } finally {
      this.answering.set(false)
    }
  }

  stopGenerating() {
    this.abortController()?.abort()
    this.answering.set(false)
  }

  triggerFun(event: KeyboardEvent, autocomplete: MatAutocomplete) {
    if ((event.isComposing || event.shiftKey) && event.key === 'Enter') {
      return
    }

    if (!this.#suggestionsOpened() && event.key === 'Enter') {
      setTimeout(() => {
        this.ask()
      })
      return
    }

    if (event.key === 'Tab') {
      event.preventDefault()
    }
  }
}
