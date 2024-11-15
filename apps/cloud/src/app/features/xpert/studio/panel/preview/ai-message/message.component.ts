import { TextFieldModule } from '@angular/cdk/text-field'
import { CommonModule } from '@angular/common'
import { Component, computed, effect, input } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { CopilotChatMessage } from 'apps/cloud/src/app/@core'
import { MaterialModule } from 'apps/cloud/src/app/@shared'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { MarkdownModule } from 'ngx-markdown'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TranslateModule,
    TextFieldModule,
    MarkdownModule,
    EmojiAvatarComponent
  ],
  selector: 'xpert-preview-ai-message',
  templateUrl: 'message.component.html',
  styleUrls: ['message.component.scss']
})
export class XpertPreviewAiMessageComponent {
  readonly message = input<CopilotChatMessage>()

  readonly contents = computed(() => {
    if (typeof this.message()?.content === 'string') {
      return [
        {
          type: 'text',
          text: this.message().content
        }
      ]
    } else if (Array.isArray(this.message()?.content)) {
      return this.message().content as any[]
    }

    return null
  })

  constructor() {
    effect(() => {
        console.log(this.contents())
    })
  }
}
