import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatSidenav } from '@angular/material/sidenav'
import { RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { MaterialModule } from '../../../@shared'
import { ChatService } from '../chat.service'
import {CdkMenuModule} from '@angular/cdk/menu'
import { KnowledgebaseListComponent, ToolsetListComponent } from '../../../@shared/copilot'
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

  readonly role = this.chatService.role

  readonly knowledgebaseList = computed(() => this.role()?.knowledgebases)
  readonly knowledgebases = this.chatService.knowledgebases

  readonly toolsetList = computed(()  => this.role()?.toolsets)
  readonly toolsets = this.chatService.toolsets
}
