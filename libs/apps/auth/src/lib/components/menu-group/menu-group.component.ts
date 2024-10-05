import { CommonModule } from '@angular/common'
import { Component, EventEmitter, HostBinding, Input, Output, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterModule } from '@angular/router'
import { DensityDirective } from '@metad/ocap-angular/core'
import { isNil } from '@metad/ocap-core'
import { PacMenuItem } from '../types'

@Component({
  standalone: true,
  selector: 'pac-menu-group',
  templateUrl: './menu-group.component.html',
  styleUrls: ['menu-group.component.scss'],
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterModule,
    DensityDirective
  ]
})
export class PacMenuGroupComponent {
  isNil = isNil

  @HostBinding('class.collapsed')
  @Input() isCollapsed = false

  readonly isMobile = input<boolean>(false)

  readonly menus = input.required<PacMenuItem[]>()

  @Output() clicked = new EventEmitter()

  isActive(menu: PacMenuItem) {
    return isNil(menu.expanded) ? menu.children?.some((item) => item.isActive) : menu.expanded
  }
}
