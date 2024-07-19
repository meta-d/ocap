import { Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { ToastrService, routeAnimations } from '../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-copilot',
  templateUrl: './copilot.component.html',
  styleUrls: ['./copilot.component.scss'],
  imports: [RouterModule, TranslateModule, MaterialModule],
  animations: [routeAnimations]
})
export class CopilotComponent extends TranslationBaseComponent {
  readonly _toastrService = inject(ToastrService)
}
