import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, effect, inject, model, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { CopilotChatMessage } from '@metad/copilot'
import { NgmSelectComponent } from '@metad/ocap-angular/common'
import { provideOcapCore } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'
import { StoryExplorerModule } from '@metad/story'
import { map } from 'rxjs'
import { routeAnimations } from '../../@core'
import { ChatbiChatComponent } from './chat/chat.component'
import { ChatbiService } from './chatbi.service'
import { injectInsightCommand } from './copilot'
import { ChatbiModelsComponent } from './models/models.component'
import { QuestionAnswer } from './types'
import { TranslateModule } from '@ngx-translate/core'

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

  // Story explorer
  readonly showExplorer = signal(false)
  readonly explore = signal<QuestionAnswer>(null)

  /**
  |--------------------------------------------------------------------------
  | Copilot
  |--------------------------------------------------------------------------
  */
  readonly #insightCommand = injectInsightCommand()

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
