import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, model, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { CopilotChatMessage } from '@metad/copilot'
import { NgmSelectComponent } from '@metad/ocap-angular/common'
import { nonBlank, provideOcapCore } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'
import { StoryExplorerModule } from '@metad/story'
import { TranslateModule } from '@ngx-translate/core'
import { injectQueryParams } from 'ngxtension/inject-query-params'
import { filter, map, switchMap } from 'rxjs'
import { ChatBIConversationService, routeAnimations } from '../../@core'
import { ChatbiChatComponent } from './chat/chat.component'
import { ChatbiService } from './chatbi.service'
import { injectInsightCommand } from './copilot'
import { ChatbiModelsComponent } from './models/models.component'
import { QuestionAnswer } from './types'

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
    NgmSelectComponent,
    ChatbiModelsComponent,
    ChatbiChatComponent,

    StoryExplorerModule
  ],
  selector: 'pac-chatbi-home',
  templateUrl: './home.component.html',
  styleUrl: 'home.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideOcapCore(), ChatbiService]
})
export class ChatbiHomeComponent {
  DisplayBehaviour = DisplayBehaviour

  readonly chatbiService = inject(ChatbiService)
  readonly conversationService = inject(ChatBIConversationService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly conversationId = injectQueryParams('id')

  readonly modelKey = model('rshEYUmoSJ')

  readonly models = toSignal(
    this.chatbiService.models$.pipe(
      map((models) =>
        models?.map((model) => ({
          key: model.key,
          value: model,
          caption: model.name
        }))
      )
    )
  )
  readonly _conversationId = computed(() => this.chatbiService.conversation()?.id)

  // readonly conversation = derivedAsync(() => {
  //   const id = this.conversationId()
  //   if (id) {
  //     return this.conversationService.getById(id)
  //   }
  //   return null
  // })

  // Story explorer
  readonly showExplorer = signal(false)
  readonly explore = signal<QuestionAnswer>(null)

  /**
  |--------------------------------------------------------------------------
  | Copilot
  |--------------------------------------------------------------------------
  */
  readonly #insightCommand = injectInsightCommand()

  private conversationSub = toObservable(this.conversationId).pipe(
    filter(nonBlank),
    switchMap((id) => this.conversationService.getById(id)),
    takeUntilDestroyed()
  ).subscribe((conversation) => this.chatbiService.addConversation(conversation))

  constructor() {
    effect(
      () => {
        const model = this.models()?.find((item) => item.key === this.modelKey())?.value
        if (model) {
          this.chatbiService.setModel(model)
        }
      },
      { allowSignalWrites: true }
    )

    effect(
      () => {
        if (this.conversationId()) {
          this.chatbiService.conversationId.set(this.conversationId())
        }
      },
      { allowSignalWrites: true }
    )

    effect(() => {
      this.router.navigate(['.'], {
        relativeTo: this.route,
        queryParams: {
          id: this._conversationId() || null
        },
      })
    }, { allowSignalWrites: true })
  }

  async openExplore(message: CopilotChatMessage, answer: QuestionAnswer) {
    console.log(answer)
    this.showExplorer.set(true)
    this.explore.set({ ...answer, key: message.id })
  }

  closeExplorer(event?: QuestionAnswer) {
    console.log(event)
    this.showExplorer.set(false)
    if (event) {
      this.chatbiService.updateQuestionAnswer(this.explore().key, event)
    }
  }
}
