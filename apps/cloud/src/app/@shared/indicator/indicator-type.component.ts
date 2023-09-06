import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { IIndicator, IndicatorType } from '../../@core'

@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule],
  selector: 'pac-indicator-type',
  template: `<div
      *ngIf="indicator.type === IndicatorType.BASIC"
      class="text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 bg-blue-100 text-blue-500 rounded-full"
    >
      {{ 'PAC.INDICATOR.Basic' | translate: { Default: 'Basic' } }}
    </div>
    <div
      *ngIf="indicator.type === IndicatorType.DERIVE"
      class="text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 bg-green-200 text-green-700 rounded-full"
    >
      {{ 'PAC.INDICATOR.Derivative' | translate: { Default: 'Derivative' } }}
    </div>`,
  styles: [``]
})
export class IndicatorTypeComponent {
  IndicatorType = IndicatorType
  
  @Input() indicator: IIndicator
}
