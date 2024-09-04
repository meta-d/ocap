import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { provideOcapCore } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { MarkdownModule } from 'ngx-markdown'
import { map } from 'rxjs/operators'
import { CopilotRoleService, IChatConversation, ICopilotRole, LanguagesEnum, routeAnimations } from '../../@core'
import { AvatarComponent, MaterialModule } from '../../@shared'
import { AppService } from '../../app.service'
import { ChatAiMessageComponent } from './ai-message/ai-message.component'
import { ChatInputComponent } from './chat-input/chat-input.component'
import { ChatService } from './chat.service'
import { ChatMoreComponent } from './icons'
import { ChatSidenavMenuComponent } from './sidenav-menu/sidenav-menu.component'
import { ChatToolbarComponent } from './toolbar/toolbar.component'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    CdkListboxModule,
    RouterModule,
    TranslateModule,
    MarkdownModule,
    MaterialModule,
    NgmCommonModule,
    AvatarComponent,

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
  readonly appService = inject(AppService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly logger = inject(NGXLogger)

  readonly isMobile = this.appService.isMobile
  readonly lang = this.appService.lang
  readonly messages = this.chatService.messages
  readonly conversations = this.chatService.conversations
  readonly conversationId = this.chatService.conversationId

  readonly roles = computed(() => {
    if ([LanguagesEnum.SimplifiedChinese, LanguagesEnum.Chinese].includes(this.lang() as LanguagesEnum)) {
      return this.chatService.roles()?.map((role) => ({ ...role, title: role.titleCN }))
    } else {
      return this.chatService.roles()
    }
  })

  selectConversation(item: IChatConversation) {
    this.chatService.setConversation(item.id)
  }

  deleteConv(id: string) {
    this.chatService.deleteConversation(id)
  }

  selectRole(role: ICopilotRole) {
    this.chatService.newConversation(role)
  }
}
