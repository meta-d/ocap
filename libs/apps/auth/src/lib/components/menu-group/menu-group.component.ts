import { Component, EventEmitter, Input, Output } from '@angular/core'
import { isNil } from '@metad/ocap-core'
import { PacMenuItem } from '../types'

@Component({
  selector: 'pac-menu-group',
  templateUrl: './menu-group.component.html',
  styleUrls: ['menu-group.component.scss']
})
export class PacMenuGroupComponent {
  isNil = isNil

  @Input() isCollapsed = false
  @Input() menu: PacMenuItem[]

  @Output() clicked = new EventEmitter()

  isActive(menu: PacMenuItem) {
    return isNil(menu.expanded) ? menu.children?.some((item) => item.isActive) : menu.expanded
  }
}
