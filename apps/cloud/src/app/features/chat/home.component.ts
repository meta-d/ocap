import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { provideOcapCore } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { MarkdownModule } from 'ngx-markdown'
import { ChatConversationService, IChatConversation, routeAnimations } from '../../@core'
import { MaterialModule } from '../../@shared'
import { AppService } from '../../app.service'
import { ChatAiMessageComponent } from './ai-message/ai-message.component'
import { ChatInputComponent } from './chat-input/chat-input.component'
import { ChatService } from './chat.service'
import { ChatSidenavMenuComponent } from './sidenav-menu/sidenav-menu.component'
import { ChatToolbarComponent } from './toolbar/toolbar.component'
import { ChatMoreComponent } from './icons'

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
    MarkdownModule,
    MaterialModule,
    NgmCommonModule,

    ChatAiMessageComponent,
    ChatToolbarComponent,
    ChatSidenavMenuComponent,
    ChatInputComponent,
    ChatMoreComponent
  ],
  selector: 'pac-chat-home',
  templateUrl: './home.component.html',
  styleUrl: 'home.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideOcapCore(), ChatService]
})
export class ChatHomeComponent {
  DisplayBehaviour = DisplayBehaviour

  readonly chatService = inject(ChatService)
  readonly conversationService = inject(ChatConversationService)
  readonly appService = inject(AppService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly logger = inject(NGXLogger)

  readonly messages = this.chatService.messages
  readonly conversations = this.chatService.conversations
  readonly conversationId = this.chatService.conversationId

  selectConversation(item: IChatConversation) {
    this.chatService.setConversation(item.id)
  }

  deleteConv(id: string) {
    this.chatService.deleteConversation(id)
  }
}
