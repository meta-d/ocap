import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatTooltipModule } from '@angular/material/tooltip'
import { DensityDirective, DisplayDensity } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NgxPopperjsModule, NgxPopperjsPlacements, NgxPopperjsTriggers } from 'ngx-popperjs'
import { NgmCopilotChatComponent } from '../chat/chat.component'
import { NgmCopilotService } from '../services'
import { CopilotGlobalService } from './global.service'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-copilot-global',
  templateUrl: 'global.component.html',
  styleUrls: ['global.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgxPopperjsModule,
    DensityDirective,
    MatTooltipModule,

    NgmCopilotChatComponent
  ],
  host: {
    class: 'ngm-copilot-global'
  }
})
export class CopilotGlobalComponent {
  NgxPopperjsPlacements = NgxPopperjsPlacements
  NgxPopperjsTriggers = NgxPopperjsTriggers
  private copilotService = inject(NgmCopilotService)
  public copilotGlobalService = inject(CopilotGlobalService)

  @Input() displayDensity: DisplayDensity | string
}
