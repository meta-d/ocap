import { Component } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { MaterialModule, TranslationBaseComponent } from '../../../../@shared'
import { CopilotFormComponent } from '../copilot-form/copilot-form.component'
import { AiProviderRole } from '@metad/contracts'

@Component({
  standalone: true,
  selector: 'pac-settings-copilot-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss'],
  imports: [TranslateModule, MaterialModule, FormsModule, ReactiveFormsModule, CopilotFormComponent]
})
export class CopilotBasicComponent extends TranslationBaseComponent {
  AiProviderRole = AiProviderRole
}
