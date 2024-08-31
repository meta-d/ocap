import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatTooltipModule } from '@angular/material/tooltip'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { CopilotChatMessage } from '@metad/copilot'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { provideOcapCore } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { ChatService, routeAnimations, uuid } from '../../@core'
import { AppService } from '../../app.service'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    RouterModule,
    TranslateModule,
    MatTooltipModule,
    MatButtonModule,
    NgmCommonModule
  ],
  selector: 'pac-chat-home',
  templateUrl: './home.component.html',
  styleUrl: 'home.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideOcapCore()]
})
export class ChatHomeComponent {
  DisplayBehaviour = DisplayBehaviour

  readonly chatService = inject(ChatService)
  readonly appService = inject(AppService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly logger = inject(NGXLogger)

  readonly input = model<string>()

  readonly conversationId = signal(uuid())

  readonly messages = signal<CopilotChatMessage[]>([])

  constructor() {
    this.chatService.connect()
    this.chatService.on('message', (result) => {
      this.messages.update((messages) => {
        const index = messages.findIndex(message => message.id === result.id)
        if (index > -1) {
          messages.splice(index, 1, {...messages[index], content: messages[index].content + result.content })
        } else {
          messages.push(result)
        }
        return [...messages]
      })
    })
  }

  ask() {
    const id = uuid()
    const content = this.input()
    this.messages.update((messages) => [
      ...messages,
      {
        id,
        role: 'user',
        content
      }
    ])
    this.chatService.message({
      id,
      conversationId: this.conversationId(),
      language: this.appService.lang(),
      content
    })
  }
}
