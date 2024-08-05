import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, ElementRef, inject, model, viewChild } from '@angular/core'
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterModule } from '@angular/router'
import { CopilotChatMessage } from '@metad/copilot'
import { NgmDisplayBehaviourComponent } from '@metad/ocap-angular/common'
import { DensityDirective } from '@metad/ocap-angular/core'
import { nonNullable } from '@metad/ocap-core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MarkdownModule } from 'ngx-markdown'
import { debounceTime, filter, map } from 'rxjs'
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
  readonly translate = inject(TranslateService)
  readonly chatbiService = inject(ChatbiService)

  readonly chatContent = viewChild('chartContent', { read: ElementRef<HTMLDivElement> })

  readonly examples = toSignal(
    this.translate
      .stream('PAC.ChatBI.SystemMessage_Samples', {
        Default: [
          'Monthly sales trends of Canadian customers in 2023',
          'Top 10 users in terms of spending in 2024',
          'What is the spending amount in each month of 2023',
          'Spending amount distribution of users in each channel in 2023',
          'How many users are there in each channel in 2023'
        ]
      })
      .pipe(map((examples) => examples))
  )

  readonly cube = this.chatbiService.entity
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
