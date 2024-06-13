import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'
import { DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { NgmCopilotService } from '@metad/copilot-angular'

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
export class NgmCopilotEnableComponent {
  private copilotService = inject(NgmCopilotService)

  @Input() title: string
  @Input() subTitle: string
  @Output() toConfig = new EventEmitter()

  get copilotConfig() {
    return this.copilotService.copilot
  }

  navigateToConfig() {
    this.toConfig.emit()
  }
}
