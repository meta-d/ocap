import { Component, Input, OnInit } from '@angular/core'
import { IUserUpdateInput, LanguagesEnum } from '@metad/contracts'
import { TranslationBaseComponent, CreatedByPipe } from '../../../../@shared'
import { ToastrService, User } from '../../../../@core'
import { PACEditUserComponent } from '../edit-user/edit-user.component'
import { UsersService } from '@metad/cloud/state'
import { ActivatedRoute } from '@angular/router'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'


@Component({
  selector: 'pac-user-basic',
  templateUrl: 'user-basic.component.html',
  styles: [`:host {
    display: flex;
    flex-direction: column;
    max-width: 700px;
    align-items: flex-start;
    margin: auto;
  }`]
})
export class UserBasicComponent extends TranslationBaseComponent implements OnInit {
  @Input() allowRoleChange: boolean

  public readonly user$ = this.userComponent.user$

  user: User
  constructor(
    private readonly userComponent: PACEditUserComponent,
    private readonly userService: UsersService,
    private readonly route: ActivatedRoute,
    private readonly _toastrService: ToastrService
  ) {
    super()

    this.user$.pipe(takeUntilDestroyed()).subscribe((user) => {
      this.user = user as User
    })
  }

  ngOnInit() {
    this.allowRoleChange = this.route.snapshot.data['allowRoleChange']
  }

  async save() {
    const { email, username, firstName, lastName, tags, preferredLanguage, password, imageUrl } = this.user
    let request: IUserUpdateInput = {
      email,
      username,
      firstName,
      lastName,
      tags,
      preferredLanguage: preferredLanguage as LanguagesEnum,
      imageUrl,
    }

    if (password) {
      request = {
        ...request,
        hash: password
      }
    }

    if (this.allowRoleChange) {
      request = {
        ...request,
        roleId: this.user.roleId
      }
    }

    try {
      await this.userService.update(this.user.id, request).then(() => {
        this._toastrService.success(`PAC.NOTES.USERS.USER_UPDATED`, {name: (new CreatedByPipe()).transform(this.user)})
      })
    } catch (error) {}
  }
}
