import { Location, DatePipe } from '@angular/common'
import { Component, Inject, LOCALE_ID } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { InvitationExpirationEnum, InvitationTypeEnum } from '@metad/contracts'
import { InviteService, Store, ToastrService } from '@metad/cloud/state'
import { TranslationBaseComponent, userLabel } from 'apps/cloud/src/app/@shared'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import isAfter from 'date-fns/isAfter'
import { withLatestFrom, map, switchMap, firstValueFrom, combineLatestWith, BehaviorSubject } from 'rxjs'
import { InviteMutationComponent } from '../../../../@shared/invite'

@Component({
  selector: 'pac-manage-user-invite',
  templateUrl: './manage-user-invite.component.html',
  styles: [
    `
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    `
  ]
})
export class ManageUserInviteComponent extends TranslationBaseComponent {
  userLabel = userLabel
  invitationTypeEnum = InvitationTypeEnum

  private readonly refresh$ = new BehaviorSubject<void>(null)

  public readonly organizationName$ = this.store.selectedOrganization$.pipe(map((org) => org?.name))

  public readonly invites$ = this.store.selectedOrganization$.pipe(
    map((org) => org?.id),
    withLatestFrom(this.store.user$.pipe(map((user) => user?.tenantId))),
    combineLatestWith(this.refresh$),
    switchMap(([[organizationId, tenantId]]) => {
      return this.inviteService.getAll(['projects', 'invitedBy', 'role', 'organizationContact', 'departments'], {
        organizationId,
        tenantId
      })
    }),
    map(({ items }) =>
      items.map((invite) => ({
        ...invite,
        createdAt: new DatePipe(this._locale).transform(new Date(invite.createdAt)),
        expireDate: invite.expireDate ? formatDistanceToNow(new Date(invite.expireDate)) : InvitationExpirationEnum.NEVER,
        statusText: invite.status === 'ACCEPTED' || !invite.expireDate || isAfter(new Date(invite.expireDate), new Date())
            ? this.getTranslation(
                `INVITE_PAGE.STATUS.${invite.status}`, { Default: invite.status }
              )
            : this.getTranslation(`INVITE_PAGE.STATUS.EXPIRED`, { Default: 'EXPIRED' }),
      }))
    )
  )

  constructor(
    private readonly store: Store,
    private readonly inviteService: InviteService,
    private readonly toastrService: ToastrService,
    private _dialog: MatDialog,
    @Inject(LOCALE_ID)
    private _locale: string,
    private location: Location
  ) {
    super()
  }

  back(): void {
    this.location.back()
  }

  async invite() {
    const dialog = this._dialog.open(InviteMutationComponent)

    const result = await firstValueFrom(dialog.afterClosed())
    // 成功邀请人数
    if (result?.total) {
      this.refresh$.next()
    }
  }

  async deleteInvite(id, email) {
		await this.inviteService.delete(id)
    this.toastrService.success(
      'TOASTR.MESSAGE.INVITES_DELETE',
      {
        email: email,
        Default: 'Invite \''+ email +'\' delete'
      }
    )
    this.refresh$.next()			
	}
}
