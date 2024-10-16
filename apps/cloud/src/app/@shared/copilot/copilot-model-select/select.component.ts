import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { Component, computed, input } from '@angular/core'
import { ICopilotModel } from '../../../@core'
import { NgmSearchComponent } from '@metad/ocap-angular/common'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CdkMenuModule,
    NgmSearchComponent
  ],
  selector: 'copilot-model-select',
  templateUrl: 'select.component.html',
  styleUrls: ['select.component.scss']
})
export class CopilotModelSelectComponent {
  readonly inheritModel = input<ICopilotModel>()
  readonly copilotModel = input<ICopilotModel>()

  readonly _copilotModel = computed(() => this.copilotModel() ?? this.inheritModel())
}
