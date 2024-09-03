import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MaterialModule } from '../../../@shared'
import { AppService } from '../../../app.service'
import { ChatService } from '../chat.service'
import { uuid } from '../../../@core'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MaterialModule,
    NgmCommonModule
  ],
  selector: 'pac-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrl: 'chat-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatInputComponent {
  readonly chatService = inject(ChatService)
  readonly appService = inject(AppService)

  readonly promptControl = new FormControl<string>(null)
  readonly prompt = toSignal(this.promptControl.valueChanges)
  readonly answering = this.chatService.answering

  ask() {
    const id = uuid()
    const content = this.prompt().trim()
    this.answering.set(true)
    this.chatService.messages.update((messages) => [
      ...(messages ?? []),
      {
        id,
        role: 'user',
        content
      }
    ])
    this.promptControl.setValue('')
    this.chatService.message(id, content)
  }

  stopGenerating() {}

  triggerFun(event: KeyboardEvent) {
    if ((event.isComposing || event.shiftKey) && event.key === 'Enter') {
      return
    }

    if (event.key === 'Enter') {
      setTimeout(() => {
        this.ask()
      })
      return
    }
  }
}
