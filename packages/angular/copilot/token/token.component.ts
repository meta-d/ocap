import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { MatTooltipModule } from '@angular/material/tooltip'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-copilot-token',
  template: `<span
    class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300"
    matTooltip="{{ 'PAC.Copilot.CharacterLength' | translate: { Default: 'Character length' } }}"
  >
    <span *ngIf="characterLength >= 4000" class="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
    <span *ngIf="characterLength < 4000" class="inline-block w-2 h-2 bg-gray-300 rounded-full"></span>
    {{ characterLength }}
  </span>`,
  styles: [
    `
      :host {
      }
    `
  ],
  imports: [CommonModule, MatTooltipModule, TranslateModule],
  host: {
    class: 'ngm-copilot-token'
  }
})
export class CopilotChatTokenComponent implements OnChanges {
  @Input() content: string

  characterLength = 0

  ngOnChanges({ content }: SimpleChanges): void {
    if (content) {
      this.characterLength = content.currentValue?.length
    }
  }
}
