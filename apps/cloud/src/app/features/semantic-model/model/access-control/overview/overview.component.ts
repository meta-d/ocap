import { Component, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { IUser, RoleTypeEnum } from '@metad/contracts'
import { userLabel, UserRoleSelectComponent } from 'apps/cloud/src/app/@shared'
import { BehaviorSubject } from 'rxjs'
import { combineLatestWith, debounceTime, map, startWith } from 'rxjs/operators'
import { AccessControlStateService } from '../access-control.service'

@Component({
  selector: 'pac-model-access-overview',
  templateUrl: 'overview.component.html',
  styleUrls: ['overview.component.scss']
})
export class AccessOverviewComponent implements OnInit {
  RoleTypeEnum = RoleTypeEnum
  roleDisplayedColumns: string[] = ['name', 'type', 'action']
  displayedColumns: string[] = ['user', 'roles', 'action']
  searchControl = new FormControl()

  public readonly roles$ = this.accessControlState.state$
  newUsers$ = new BehaviorSubject<IUser[]>([])
  userRoles$ = this.accessControlState.state$.pipe(
    map((modelRoles) => {
      const users = []
      const roles = []
      const userIndex = {}
      modelRoles.forEach((modelRole) => {
        roles.push(modelRole.name)
        modelRole.users.forEach((user: IUser) => {
          if (!userIndex[user.id]) {
            userIndex[user.id] = { user, roles: [] }
            users.push(userIndex[user.id])
          }
          userIndex[user.id].roles.push(modelRole.name)
        })
      })

      return {
        users,
        roles
      }
    }),
    combineLatestWith(this.newUsers$),
    map(([userRoles, newUsers]) => {
      newUsers.forEach((newUser) => {
        if (!userRoles.users.find((item) => item.user.id === newUser.id)) {
          userRoles.users.push({user: newUser, roles: []})
        }
      })

      userRoles.users = userRoles.users.map((item) => ({
        ...item,
        user: {
          ...item.user,
          fullName: userLabel(item.user)
        }
      }))
      return userRoles
    }),
    combineLatestWith(this.searchControl.valueChanges.pipe(debounceTime(300), startWith(''))),
    map(([userRoles, text]) => {

      if (text.trim()) {
        text = text.trim().toLowerCase()
        return {
          ...userRoles,
          users: userRoles.users.filter((item) => item.user.fullName.toLowerCase().includes(text))
        }
      }

      return userRoles
    })
  )
  constructor(private accessControlState: AccessControlStateService,
    private _dialog: MatDialog) {}

  ngOnInit() {}

  onAddUser() {
    this._dialog
      .open(UserRoleSelectComponent)
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.newUsers$.next([...this.newUsers$.value, ...value.users])
        }
      })
  }

  onRolesChange(event, user: IUser) {
    this.accessControlState.changeUserRoles({ user, roles: event })
  }

  removeUser(id: string) {
    this.accessControlState.removeUser(id)
  }

  removeRole(key: string) {
    this.accessControlState.removeRole(key)
  }
}
