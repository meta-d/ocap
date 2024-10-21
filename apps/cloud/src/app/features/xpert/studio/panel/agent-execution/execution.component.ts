import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { FFlowModule } from '@foblex/flow'
import { NgmHighlightVarDirective } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { IXpert, IXpertAgent, XpertAgentService } from 'apps/cloud/src/app/@core'
import { XpertAvatarComponent, MaterialModule, CopilotModelSelectComponent } from 'apps/cloud/src/app/@shared'
import { MarkdownModule } from 'ngx-markdown'
import { XpertStudioApiService } from '../../domain'


@Component({
  selector: 'xpert-studio-panel-agent-execution',
  templateUrl: './execution.component.html',
  styleUrls: ['./execution.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FFlowModule,
    MaterialModule,
    FormsModule,
    TranslateModule,
    MarkdownModule,
    XpertAvatarComponent,
    NgmHighlightVarDirective,
    CopilotModelSelectComponent
  ],
  host: {
    tabindex: '-1',
    '[class.selected]': 'isSelected',
  }
})
export class XpertStudioPanelAgentExecutionComponent {
  readonly xpertAgentService = inject(XpertAgentService)
  readonly apiService = inject(XpertStudioApiService)

  readonly xpert = input<IXpert>()
  readonly xpertAgent = input<IXpertAgent>()

  readonly input = model<string>(null)

  readonly output = signal('')

  startRunAgent() {
    this.output.set('')
    this.xpertAgentService.chatAgent({
      input: this.input(),
      agent: this.xpertAgent(),
      xpert: this.xpert()
    }).subscribe({
      next: (msg) => {
        // console.log(msg.data)
        this.output.update((state) => state + msg.data)
      }
    })
  }
}
