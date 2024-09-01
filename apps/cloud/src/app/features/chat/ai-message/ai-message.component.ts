import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { CopilotChatMessage } from '@metad/copilot'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MarkdownModule } from 'ngx-markdown'
import { MaterialModule } from '../../../@shared'

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
    MarkdownModule,
    MaterialModule,
    NgmCommonModule
  ],
  selector: 'pac-ai-message',
  templateUrl: './ai-message.component.html',
  styleUrl: 'ai-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatAiMessageComponent {
  readonly message = input<CopilotChatMessage>()

  onCopy(copyButton) {
    copyButton.copied = true
    setTimeout(() => {
      copyButton.copied = false
    }, 3000)
  }
}
