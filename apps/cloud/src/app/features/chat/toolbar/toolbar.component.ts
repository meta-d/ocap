import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatSidenav } from '@angular/material/sidenav'
import { RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MaterialModule } from '../../../@shared'
import { KnowledgebaseListComponent, ToolsetListComponent } from '../../../@shared/copilot'
import { ChatService } from '../chat.service'
import { Icons } from '../icons'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CdkMenuModule,
    TranslateModule,
    MaterialModule,
    NgmCommonModule,
    ...Icons,
    KnowledgebaseListComponent,
    ToolsetListComponent
  ],
  selector: 'pac-chat-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: 'toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatToolbarComponent {
  readonly chatService = inject(ChatService)

  readonly sidenav = input<MatSidenav>()

  readonly role = toSignal(this.chatService.role$)

  readonly knowledgebaseList = computed(() => this.role()?.knowledgebases)
  readonly knowledgebases = this.chatService.knowledgebases

  readonly toolsetList = computed(() => this.role()?.toolsets)
  readonly toolsets = this.chatService.toolsets
}
