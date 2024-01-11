import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core'

@Component({
  selector: 'ngm-drawer-trigger',
  standalone: true,
  imports: [],
  templateUrl: './drawer-trigger.component.html',
  styleUrl: './drawer-trigger.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgmDrawerTriggerComponent {
  @HostBinding('class.ngm-drawer__opened')
  @Input() opened: boolean = false
  @Input() side: 'left' | 'right' = 'left'

  @Output() openedChange: EventEmitter<boolean> = new EventEmitter<boolean>()

  toggle() {
    this.opened = !this.opened
    this.openedChange.emit(this.opened)
  }
}
