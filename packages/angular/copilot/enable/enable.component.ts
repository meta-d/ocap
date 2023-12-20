import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'
import { DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NgmCopilotService } from '../services'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-copilot-enable',
  templateUrl: 'enable.component.html',
  styleUrls: ['enable.component.scss'],
  imports: [CommonModule, RouterModule, TranslateModule, MatIconModule, MatButtonModule, DensityDirective],
  host: {
    class: 'ngm-copilot-enable'
  }
})
export class CopilotEnableComponent {
  private copilotService = inject(NgmCopilotService)

  @Input() title: string
  @Input() subTitle: string
  @Output() toConfig = new EventEmitter()

  readonly copilotConfig = toSignal(this.copilotService.copilot$)

  navigateToConfig() {
    this.toConfig.emit()
  }
}
