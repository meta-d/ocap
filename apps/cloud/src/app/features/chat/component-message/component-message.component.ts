import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { NxWidgetKpiComponent } from '@metad/story/widgets/kpi'
import { TranslateModule } from '@ngx-translate/core'
import { MarkdownModule } from 'ngx-markdown'
import { Store } from '../../../@core'
import { MaterialModule } from '../../../@shared'
import { ChatService } from '../chat.service'
import { ChatHomeComponent } from '../home.component'

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
    NgmCommonModule,
    AnalyticalCardModule,
    NxWidgetKpiComponent
  ],
  selector: 'pac-chat-component-message',
  templateUrl: './component-message.component.html',
  styleUrl: 'component-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponentMessageComponent {
  readonly #store = inject(Store)
  readonly chatService = inject(ChatService)
  readonly homeComponent = inject(ChatHomeComponent)

  readonly message = input<any>()

  readonly data = computed(() => this.message()?.data as any)

  readonly primaryTheme = toSignal(this.#store.primaryTheme$)

  readonly chartSettings = computed(() => {
    return {
      ...(this.data()?.chartSettings ?? {}),
      theme: this.primaryTheme()
    }
  })

  readonly dataSource = computed(() => {
    return this.data()?.dataSettings?.dataSource
  })

  constructor() {
    effect(() => {
      if (this.dataSource()) {
        this.homeComponent.registerSemanticModel(this.dataSource())
      }
    }, { allowSignalWrites: true })
  }
}
