import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { RouterModule } from '@angular/router'
import { DensityDirective } from '@metad/ocap-angular/core'
import { isNil } from '@metad/ocap-core'
import { PacMenuItem } from '../types'
import { MatTooltipModule } from '@angular/material/tooltip'

@Component({
  standalone: true,
  selector: 'pac-menu-group',
  templateUrl: './menu-group.component.html',
  styleUrls: ['menu-group.component.scss'],
  imports: [CommonModule, MatMenuModule, MatIconModule, MatTooltipModule, RouterModule, DensityDirective]
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
