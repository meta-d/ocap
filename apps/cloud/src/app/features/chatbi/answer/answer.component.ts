import { ClipboardModule } from '@angular/cdk/clipboard'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterModule } from '@angular/router'
import { CopilotChatMessage, JSONValue } from '@metad/copilot'
import { NgmCopilotEngineService } from '@metad/copilot-angular'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { NgmDisplayBehaviourComponent } from '@metad/ocap-angular/common'
import { DensityDirective } from '@metad/ocap-angular/core'
import { NgmSelectionModule, SlicersCapacity } from '@metad/ocap-angular/selection'
import { TranslateModule } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { MarkdownModule } from 'ngx-markdown'
import { ChatbiService } from '../chatbi.service'
import { QuestionAnswer } from '../types'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    ClipboardModule,
    MarkdownModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatInputModule,
    MatMenuModule,
    DensityDirective,
    NgmDisplayBehaviourComponent,

    AnalyticalCardModule,
    NgmSelectionModule
  ],
  selector: 'pac-chatbi-answer',
  templateUrl: 'answer.component.html',
  styleUrl: 'answer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatbiAnswerComponent {
  SlicersCapacity = SlicersCapacity
  
  readonly chatbiService = inject(ChatbiService)
  readonly #copilotEngine = inject(NgmCopilotEngineService)
  readonly #logger = inject(NGXLogger)

  readonly message = input<CopilotChatMessage>(null)

  toArray(data: JSONValue) {
    return Array.isArray(data) ? data : []
  }

  typeof(data: JSONValue) {
    return typeof data
  }

  onCopy(copyButton) {
    copyButton.copied = true
    setTimeout(() => {
      copyButton.copied = false
    }, 3000)
  }

  isAnswer(value: JSONValue): QuestionAnswer {
    return value as unknown as QuestionAnswer
  }
}
