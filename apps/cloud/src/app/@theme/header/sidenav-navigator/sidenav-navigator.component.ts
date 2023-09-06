import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { MatDrawerMode } from '@angular/material/sidenav'

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'pac-sidenav-navigator',
  templateUrl: 'sidenav-navigator.component.svg'
})
export class SidenavNavigatorComponent {
  @Input() mode: MatDrawerMode
}
