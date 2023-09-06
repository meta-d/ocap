import { Component, EventEmitter, Input, Output } from '@angular/core'
import { BehaviorSubject, map } from 'rxjs'
import { PacMenuItem } from '../types'

@Component({
  selector: 'pac-menu',
  templateUrl: 'menu.component.html',
  styleUrls: ['menu.component.scss']
})
export class PacMenuComponent {
  @Input() isCollapsed = false
  @Input() get menu(): PacMenuItem[] {
    return this._menu$.value
  }
  set menu(value) {
    this._menu$.next(value)
  }
  private _menu$ = new BehaviorSubject<PacMenuItem[]>([])

  @Output() clicked = new EventEmitter()

  menus$ = this._menu$.pipe(map((menus) => menus.filter((menu) => !menu.hidden)))
  general$ = this.menus$.pipe(map((menus) => menus.filter((menu) => !menu.admin)))
  admin$ = this.menus$.pipe(map((menus) => menus.filter((menu) => menu.admin)))
}
