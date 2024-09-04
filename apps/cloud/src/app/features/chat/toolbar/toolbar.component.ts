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
import { AppService } from '../../../app.service'
import { LanguagesEnum } from '../../../@core'

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
  readonly appService = inject(AppService)

  readonly sidenav = input<MatSidenav>()

  readonly lang = this.appService.lang
  readonly _role = toSignal(this.chatService.role$)

  readonly knowledgebaseList = computed(() => this._role()?.knowledgebases)
  readonly knowledgebases = this.chatService.knowledgebases

  readonly toolsetList = computed(() => this._role()?.toolsets)
  readonly toolsets = this.chatService.toolsets

  readonly role = computed(() => {
    if (!this._role()) {
      return null
    }
    if ([LanguagesEnum.SimplifiedChinese, LanguagesEnum.Chinese].includes(this.lang() as LanguagesEnum)) {
      return { ...this._role(), title: this._role().titleCN }
    } else {
      return this._role()
    }
  })
}
