import { DragDropModule } from '@angular/cdk/drag-drop'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { effectAction, provideOcapCore } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'
import { IntersectionObserverModule } from '@ng-web-apis/intersection-observer'
import { TranslateModule } from '@ngx-translate/core'
import { format } from 'date-fns/format'
import { isToday } from 'date-fns/isToday'
import { isWithinInterval } from 'date-fns/isWithinInterval'
import { isYesterday } from 'date-fns/isYesterday'
import { subDays } from 'date-fns/subDays'
import { NGXLogger } from 'ngx-logger'
import { switchMap, tap } from 'rxjs/operators'
import { ChatConversationService, IChatConversation, ICopilotRole, OrderTypeEnum, routeAnimations } from '../../@core'
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
    IntersectionObserverModule,
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
  readonly conversationService = inject(ChatConversationService)
  readonly appService = inject(AppService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly logger = inject(NGXLogger)

  readonly isMobile = this.appService.isMobile
  readonly lang = this.appService.lang
  readonly messages = this.chatService.messages
  readonly conversationId = this.chatService.conversationId
  readonly groups = computed(() => {
    const conversations = this.chatService.conversations()
    // 定义分组时间段
    const startOfToday = new Date()
    const startOfLast7Days = subDays(startOfToday, 7)
    const startOfLast30Days = subDays(startOfToday, 30)
    const groups: { name: string; values: IChatConversation[] }[] = []
    let currentGroup: (typeof groups)[0] = null
    conversations.forEach((item) => {
      const recordDate = new Date(item.updatedAt)
      let name = ''
      if (isToday(recordDate)) {
        name = 'Today'
      } else if (isYesterday(recordDate)) {
        name = 'Yesterday'
      } else if (isWithinInterval(recordDate, { start: startOfLast7Days, end: startOfToday })) {
        name = 'Last7Days'
      } else if (isWithinInterval(recordDate, { start: startOfLast30Days, end: startOfLast7Days })) {
        name = 'Last30Days'
      } else {
        // 按月份分组
        const monthKey = format(recordDate, 'yyyy-MM') //{locale: eoLocale});
        name = monthKey
      }

      if (name !== currentGroup?.name) {
        currentGroup = {
          name,
          values: [item]
        }
        groups.push(currentGroup)
      } else {
        currentGroup.values.push(item)
      }
    })

    return groups
  })

  readonly roles = this.chatService.roles
  readonly role = this.chatService.role

  readonly editingConversation = signal<string>(null)
  readonly editingTitle = signal<string>(null)

  readonly loading = signal(false)
  readonly pageSize = 20
  readonly currentPage = signal(0)
  readonly done = signal(false)

  constructor() {
    this.loadConversations()
  }

  selectConversation(item: IChatConversation) {
    this.chatService.setConversation(item.id)
  }

  deleteConv(id: string) {
    this.chatService.deleteConversation(id)
  }

  selectRole(role: ICopilotRole) {
    this.chatService.newConversation(role)
  }

  updateTitle(conv: IChatConversation) {
    this.conversationService.update(this.editingConversation(), { title: this.editingTitle() }).subscribe({
      next: () => {
        this.logger.debug('Updated conversation title')
        conv.title = this.editingTitle()
        this.editingConversation.set(null)
        this.editingTitle.set('')
      }
    })
  }

  loadConversations = effectAction((origin$) => {
    return origin$.pipe(
      switchMap(() => {
        this.loading.set(true)
        return this.conversationService.getMyInOrg({
          select: ['id', 'key', 'title', 'updatedAt'],
          order: { updatedAt: OrderTypeEnum.DESC },
          take: this.pageSize,
          skip: this.currentPage() * this.pageSize
        })
      }),
      tap({
        next: ({ items, total }) => {
          this.chatService.conversations.update((state) => [...state, ...items])
          this.currentPage.update((state) => ++state)
          if (items.length < this.pageSize || this.currentPage() * this.pageSize >= total) {
            this.done.set(true)
          }
          this.loading.set(false)
        },
        error: (err) => {
          this.loading.set(false)
        },
      })
    )
  })

  onIntersection() {
    if (!this.loading() && !this.done()) {
      this.loadConversations()
    }
  }
}
