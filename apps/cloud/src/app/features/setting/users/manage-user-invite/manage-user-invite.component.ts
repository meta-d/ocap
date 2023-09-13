import { Location, DatePipe } from '@angular/common'
import { Component, Inject, LOCALE_ID, inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { InvitationExpirationEnum, InvitationTypeEnum } from '@metad/contracts'
import { InviteService, Store, ToastrService } from '@metad/cloud/state'
import { InlineSearchComponent, MaterialModule, SharedModule, TranslationBaseComponent, UserProfileInlineComponent, userLabel } from 'apps/cloud/src/app/@shared'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import isAfter from 'date-fns/isAfter'
import { withLatestFrom, map, switchMap, firstValueFrom, combineLatestWith, BehaviorSubject } from 'rxjs'
import { InviteMutationComponent } from '../../../../@shared/invite'
import { ButtonGroupDirective, OcapCoreModule } from '@metad/ocap-angular/core'
import { NxTableModule } from '@metad/components/table'
import { PACUsersComponent } from '../users.component'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

@Component({
  standalone: true,
  selector: 'pac-manage-user-invite',
  templateUrl: './manage-user-invite.component.html',
  styleUrls: ['./manage-user-invite.component.scss'],
  imports: [
    SharedModule,
    MaterialModule,
    // Standard components
    ButtonGroupDirective,
    NxTableModule,
    InlineSearchComponent,
    // OCAP Modules
    OcapCoreModule,
    UserProfileInlineComponent
  ]
})
export class ManageUserInviteComponent extends TranslationBaseComponent {
  userLabel = userLabel
  invitationTypeEnum = InvitationTypeEnum

  private readonly usersComponent = inject(PACUsersComponent)

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
                `PAC.INVITE_PAGE.STATUS.${invite.status}`, { Default: invite.status }
              )
            : this.getTranslation(`PAC.INVITE_PAGE.STATUS.EXPIRED`, { Default: 'EXPIRED' }),
      }))
    )
  )

  private invitedSub = this.usersComponent.invitedEvent.pipe(takeUntilDestroyed()).subscribe(() => {
    this.refresh()
  })

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

  refresh() {
    this.refresh$.next()
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
