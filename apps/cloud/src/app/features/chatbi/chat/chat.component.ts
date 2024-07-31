import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, effect, inject, model } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterModule } from '@angular/router'
import { CopilotChatMessage } from '@metad/copilot'
import { NgmDisplayBehaviourComponent } from '@metad/ocap-angular/common'
import { DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { MarkdownModule } from 'ngx-markdown'
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
    MarkdownModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatDividerModule,
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

  readonly examples = [
    '2024 年所有用户中消费金额前 10 的用户',
    '2023 年各个月的消费金额分别是多少',
    '2023 年各渠道用户的消费金额分布',
    '2023 年各渠道的用户数分别是多少',
    '2024 年所有用户的男女比例',
  ]

  readonly cube = this.chatbiService.cube
  readonly entityType = this.chatbiService.entityType

  readonly prompt = model<string>('分析退货金额')

  readonly conversation = this.chatbiService.conversation

  constructor() {
    effect(() => {
      console.log(this.entityType(), this.chatbiService.dataSourceName())
    })
  }

  editQuestion(message: CopilotChatMessage) {
    this.prompt.set(message.content)
  }

  setExample(example: string) {
    this.prompt.set(example)
  }
}
