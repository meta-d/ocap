import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, HostListener, input, model } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatTooltipModule } from '@angular/material/tooltip'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  selector: 'copilot-prompt-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CdkMenuModule, FormsModule, TranslateModule, MatTooltipModule],
})
export class CopilotPromptGeneratorComponent {

}
