import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, effect, inject, model } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { provideOcapCore } from '@metad/ocap-angular/core'
import { routeAnimations } from '../../@core'
import { ChatbiService } from './chatbi.service'
import { ChatbiModelsComponent } from './models/models.component'
import { toSignal } from '@angular/core/rxjs-interop'
import { map } from 'rxjs'
import { NgmSelectComponent } from '@metad/ocap-angular/common'
import { ChatbiChatComponent } from './chat/chat.component'
import { injectInsightCommand } from './copilot'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    RouterModule,
    NgmSelectComponent,
    ChatbiModelsComponent,
    ChatbiChatComponent
  ],
  selector: 'pac-chatbi-home',
  templateUrl: './home.component.html',
  styleUrl: 'home.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideOcapCore(), ChatbiService]
})
export class ChatbiHomeComponent {
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

  /**
  |--------------------------------------------------------------------------
  | Copilot
  |--------------------------------------------------------------------------
  */
  readonly #insightCommand = injectInsightCommand()

  constructor() {
    effect(() => {
      const model = this.models().find((item) => item.key === this.modelKey())?.value
      if (model) {
        this.chatbiService.setModel(model)
      }
    }, { allowSignalWrites: true })
  }
}
