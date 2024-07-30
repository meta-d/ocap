import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterModule } from '@angular/router'
import { CopilotChatMessage } from '@metad/copilot'
import { NgmDisplayBehaviourComponent } from '@metad/ocap-angular/common'
import { DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { ChatbiAnswerComponent } from '../answer/answer.component'
import { ChatbiService } from '../chatbi.service'
import { ChatbiInputComponent } from '../input/input.component'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    DensityDirective,
    NgmDisplayBehaviourComponent,

    ChatbiInputComponent,
    ChatbiAnswerComponent
  ],
  selector: 'pac-chatbi-chat',
  templateUrl: 'chat.component.html',
  styleUrl: 'chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatbiChatComponent {
  readonly chatbiService = inject(ChatbiService)

  readonly prompt = model<string>('分析退货金额')

  readonly conversation = this.chatbiService.conversation

  editQuestion(message: CopilotChatMessage) {
    this.prompt.set(message.content)
  }
}
