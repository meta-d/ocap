import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { ISelectOption, splitByHighlight } from '@metad/ocap-angular/core'
import { DisplayBehaviour } from '@metad/ocap-core'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-display-behaviour',
  templateUrl: './display-behaviour.component.html',
  styleUrls: ['./display-behaviour.component.scss'],
  imports: [CommonModule, MatIconModule]
})
export class NgmDisplayBehaviourComponent implements OnInit, OnChanges {
  DISPLAY_BEHAVIOUR = DisplayBehaviour

  @Input() displayBehaviour: DisplayBehaviour | string
  @HostBinding('class.ngm-display-behaviour__exclude-selected')
  @Input()
  excludeSelected: boolean
  @Input() option: ISelectOption
  @Input() highlight: string

  @HostBinding('class.ngm-display-behaviour') isDisplayBehaviour = true

  @HostBinding('class.ngm-display-behaviour__descriptionAndId')
  get isDescriptionAndId() {
    return this.displayBehaviour === DisplayBehaviour.descriptionAndId
  }

  @HostBinding('class.ngm-display-behaviour__idAndDescription')
  get isIdAndDescription() {
    return this.displayBehaviour === DisplayBehaviour.idAndDescription
  }

  @HostBinding('class.ngm-display-behaviour__descriptionOnly')
  get isDescriptionOnly() {
    return this.displayBehaviour === DisplayBehaviour.descriptionOnly
  }

  @HostBinding('class.ngm-display-behaviour__auto')
  get isAuto() {
    return this.displayBehaviour === DisplayBehaviour.auto || !this.displayBehaviour
  }

  @HostBinding('class.ngm-display-behaviour__no-label')
  get noLabel() {
    return !(this.option?.caption || this.option?.label)
  }

  value: any = []
  text: any = []
  default: any = []
  ngOnInit() {
    this.value = splitByHighlight(this.option.key ?? this.option.value, this.highlight)
    this.text = splitByHighlight(this.option.caption || this.option.label, this.highlight)
    this.default = splitByHighlight(this.option.caption || this.option.label || this.option.value, this.highlight)
  }

  ngOnChanges({ highlight, option }: SimpleChanges): void {
    if (highlight || option) {
      this.value = splitByHighlight(this.option.key ?? this.option.value, this.highlight)
      this.text = splitByHighlight(this.option.caption || this.option.label, this.highlight)
      this.default = splitByHighlight(
        this.option.caption || this.option.label || (this.option.key ?? this.option.value),
        this.highlight
      )
    }
  }
}
