import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, ElementRef, inject, model, viewChild } from '@angular/core'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'
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
import { debounceTime, filter } from 'rxjs'
import { ChatbiAnswerComponent } from '../answer/answer.component'
import { ChatbiService } from '../chatbi.service'
import { ChatbiInputComponent } from '../input/input.component'
import { nonNullable } from '@metad/ocap-core'

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

  readonly chatContent = viewChild('chartContent', { read: ElementRef<HTMLDivElement> })

  readonly examples = [
    '2023年加拿大客户每月的销售额走势',
    '2024年所有用户中消费金额前 10 的用户',
    '2023年各个月的消费金额分别是多少',
    '2023年各渠道用户的消费金额分布',
    '2023年各渠道的用户数分别是多少'
  ]

  readonly cube = this.chatbiService.cube
  readonly entityType = this.chatbiService.entityType

  readonly prompt = model<string>(null)

  readonly conversation = this.chatbiService.conversation

  private scrollSub = toObservable(this.conversation)
    .pipe(filter(nonNullable), debounceTime(1000), takeUntilDestroyed())
    .subscribe(() => this.scrollBottom())

  editQuestion(message: CopilotChatMessage) {
    this.prompt.set(message.content)
  }

  setExample(example: string) {
    this.prompt.set(example)
  }

  scrollBottom() {
    this.chatContent()?.nativeElement.scrollTo({
      top: this.chatContent().nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    })
  }
}
