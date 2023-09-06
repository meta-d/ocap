import { Injectable, signal } from '@angular/core'
import { BehaviorSubject, Subject } from 'rxjs'

export interface WidgetState {
  menus: WidgetMenu[]
}

export enum WidgetMenuType {
  Toggle = 'Toggle',
  Action = 'Action',
  Menus = 'Menus',
  Divider = 'Divider'
}

export interface WidgetMenu {
  key: string
  name?: string
  label?: string
  type: WidgetMenuType
  action?: string
  icon?: string
  // 是否只在编辑状态存在
  editable?: boolean
  selected?: boolean
  menus?: WidgetMenu[]
  value?: unknown
}

@Injectable()
export class WidgetService {
  readonly menus$ = new BehaviorSubject<WidgetMenu[]>(null)

  private _menuClick$ = new Subject<WidgetMenu>()

  private readonly refresh$ = new Subject<boolean>()

  public explains = signal<any[]>([])

  setMenus(menus: WidgetMenu[]) {
    this.menus$.next(menus)
  }

  toggleMenu(menu: WidgetMenu) {
    this.menus$.next(toggleMenu(this.menus$.value, menu.key))
  }

  clickMenu(menu: WidgetMenu) {
    if (menu.type === WidgetMenuType.Toggle) {
      this.toggleMenu(menu)
    }
    this._menuClick$.next(menu)
  }

  public onMenuClick() {
    return this._menuClick$
  }

  public refresh(force = false) {
    this.refresh$.next(force)
  }

  public onRefresh() {
    return this.refresh$.asObservable()
  }
}

function toggleMenu(menus: WidgetMenu[], key: string) {
  menus.forEach((item) => {
    if (item.type === WidgetMenuType.Menus) {
      toggleMenu(item.menus, key)
    } else if (item.key === key) {
      item.selected = !item.selected
    }
  })

  return [...menus]
}
