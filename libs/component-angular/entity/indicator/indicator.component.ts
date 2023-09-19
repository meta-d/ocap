import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { Component, Input } from '@angular/core'
import { DisplayBehaviour, Indicator } from '@metad/ocap-core'

@Component({
  selector: 'ngm-indicator',
  templateUrl: './indicator.component.html',
  styleUrls: ['./indicator.component.scss']
})
export class IndicatorComponent {
  @Input() indicator: Indicator
  @Input() displayBehaviour: DisplayBehaviour | string
  @Input() get hiddenIcon() {
    return this._hiddenIcon
  }
  set hiddenIcon(value) {
    this._hiddenIcon = coerceBooleanProperty(value)
  }
  private _hiddenIcon = null

  @Input() highlight: string

  icon: string = 'trending_up'
}
