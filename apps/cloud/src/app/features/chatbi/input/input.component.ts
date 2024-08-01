import {
  CdkMenu,
  CdkMenuGroup,
  CdkMenuItem,
  CdkMenuItemCheckbox,
  CdkMenuItemRadio,
  CdkMenuTrigger
} from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatTooltipModule } from '@angular/material/tooltip'
import { Router, RouterModule } from '@angular/router'
import { NgmCopilotEngineService, NgmCopilotService } from '@metad/copilot-angular'
import { NgmDisplayBehaviourComponent, NgmSearchComponent } from '@metad/ocap-angular/common'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject, delay } from 'rxjs'
import { ChatbiService } from '../chatbi.service'
import { CHATBI_COMMAND_NAME } from '../copilot/'
import { AppService } from '../../../app.service'

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

    CdkMenuTrigger,
    CdkMenu,
    CdkMenuItemCheckbox,
    CdkMenuGroup,
    CdkMenuItemRadio,
    CdkMenuItem,

    DensityDirective,
    NgmSearchComponent,
    NgmDisplayBehaviourComponent,
    AppearanceDirective
  ],
  selector: 'pac-chatbi-input',
  templateUrl: 'input.component.html',
  styleUrl: 'input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatbiInputComponent {
  readonly chatbiService = inject(ChatbiService)
  readonly #copilotEngine = inject(NgmCopilotEngineService)
  readonly copilotService = inject(NgmCopilotService)
  readonly #logger = inject(NGXLogger)
  readonly router = inject(Router)

  readonly cube = this.chatbiService.entity

  readonly prompts = signal([])
  readonly prompt = model<string>('')
  readonly answering = signal(false)
  readonly conversation = this.chatbiService.conversation

  readonly copilotConversation = computed(() => this.#copilotEngine.conversation())
  readonly abortController = computed(() => this.copilotConversation()?.abortController)

  readonly suggestionsOpened$ = new BehaviorSubject(false)
  readonly #suggestionsOpened = toSignal(this.suggestionsOpened$.pipe(delay(100)), { initialValue: false })

  readonly conversations = computed(() => {
    const items = this.chatbiService.conversations()
    const conversation = this.chatbiService.conversation()
    return items?.map((item) => ({ key: item.key, name: item.name }))
  })

  readonly copilotEnabled = toSignal(this.copilotService.enabled$)

  newChat() {
    this.chatbiService.newConversation()
  }

  setConversation(id: string) {
    this.chatbiService.setConversation(id)
  }

  deleteConversation(id: string) {
    this.chatbiService.deleteConversation(id)
  }

  async ask() {
    const prompt = this.prompt().trim()
    try {
      this.answering.set(true)
      this.prompt.set('')
      this.chatbiService.addHumanMessage(prompt)
      if (!this.conversation().command) {
        this.chatbiService._updateConversation(this.conversation().key, (state) => ({
          ...state,
          command: CHATBI_COMMAND_NAME
        }))
        await this.#copilotEngine.chat(`/${CHATBI_COMMAND_NAME} ${prompt}`, {})
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

  navigateToConfig() {
    this.router.navigate(['settings', 'copilot'])
  }
}
