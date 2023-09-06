import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { Store, UsersService } from '@metad/cloud/state'
import { ConfirmDeleteComponent } from '@metad/components/confirm'
import { includes } from 'lodash-es'
import { BehaviorSubject, firstValueFrom, map, startWith, switchMap } from 'rxjs'
import { Group, IUser, RolesEnum, routeAnimations, ROUTE_ANIMATIONS_ELEMENTS, ToastrService } from '../../../@core/index'
import { InviteMutationComponent } from '../../../@shared/invite'
import { userLabel } from '../../../@shared/pipes'
import { UserMutationComponent } from '../../../@shared/user'
import { TranslationBaseComponent } from '../../../@shared/language/translation-base.component'

@Component({
  selector: 'pac-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PACUsersComponent extends TranslationBaseComponent {
  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS

  private readonly store = inject(Store)
  private userService = inject(UsersService)
  private router = inject(Router)
  private _dialog = inject(MatDialog)
  private toastrService = inject(ToastrService)

  ROLES = Object.keys(RolesEnum)
  roles$ = new BehaviorSubject<string[]>([])
  get roles() {
    return this.roles$.value
  }
  set roles(value) {
    this.roles$.next(value)
  }
  user = 'A'
  private search$ = new BehaviorSubject<string>('')
  get search() {
    return this.search$.value
  }
  set search(value) {
    this.search$.next(value)
  }

  private refresh$ = new BehaviorSubject<void>(null)
  public readonly users$ = this.refresh$.pipe(
    switchMap(() => this.userService.getAll(['role'])),
    switchMap((users) => this.roles$.pipe(map((roles) => roles?.length ? users.filter((user) => includes(roles, user.role.name)) : users))),
    switchMap((users) => {
      return this.search$.pipe(
        startWith(this.search),
        map((text: string) => {
          text = text?.toLowerCase()
          return text
            ? users.filter(
                (user) =>
                  user.name?.toLowerCase().includes(text) ||
                  user.lastName?.toLowerCase().includes(text) ||
                  user.firstName?.toLowerCase().includes(text) ||
                  user.email?.toLowerCase().includes(text)
              )
            : users
        })
      )
    })
  )
  public readonly organizationName$ = this.store.selectedOrganization$.pipe(map((org) => org?.name))

  checkChange(e: boolean): void {
    console.log(e)
  }

  navUser(user: IUser) {
    this.router.navigate(['/settings/users/edit/', user.id])
  }

  navGroup(group: Group) {
    this.router.navigate(['/settings/groups/', group.id])
  }

  manageInvites() {
		this.router.navigate(['/settings/users/invites/']);
	}

  async add() {
    const user = await firstValueFrom(this._dialog
      .open(UserMutationComponent, { data: { isAdmin: true } })
      .afterClosed()
    )
    if (user) {
      this.refresh$.next()
    }
  }

  async invite() {
    const user = await firstValueFrom(this._dialog.open(InviteMutationComponent,).afterClosed())
  }

  /**
   * 对比下面函数的写法
   */
  async remove(user: IUser) {
    const confirm = await firstValueFrom(this._dialog.open(ConfirmDeleteComponent, { data: {value: userLabel(user)} }).afterClosed())
    if (confirm) {
      try {
        await firstValueFrom(this.userService.delete(user.id, user))
        this.toastrService.success('PAC.NOTES.USERS.UserDelete', {
          name: userLabel(user)
        })
        this.refresh$.next()
      } catch (err) {
        this.toastrService.error('PAC.NOTES.USERS.UserDelete', '', {
          name: userLabel(user)
        })
      }
    }
  }
}
