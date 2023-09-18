import { Component, Input, OnInit, effect } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { UsersService } from '@metad/cloud/state'
import { IUserUpdateInput, LanguagesEnum } from '@metad/contracts'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { UserFormsModule } from 'apps/cloud/src/app/@shared/user/forms'
import { ToastrService, User } from '../../../../@core'
import { CreatedByPipe, MaterialModule, SharedModule, TranslationBaseComponent } from '../../../../@shared'
import { PACEditUserComponent } from '../edit-user/edit-user.component'

@Component({
  standalone: true,
  selector: 'pac-user-basic',
  templateUrl: 'user-basic.component.html',
  styles: [
    `
      :host {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    `
  ],
  imports: [SharedModule, MaterialModule, NgmCommonModule, UserFormsModule]
})
export class UserBasicComponent extends TranslationBaseComponent implements OnInit {
  @Input() allowRoleChange: boolean

  user: User
  constructor(
    private readonly userComponent: PACEditUserComponent,
    private readonly userService: UsersService,
    private readonly route: ActivatedRoute,
    private readonly _toastrService: ToastrService
  ) {
    super()

    effect(() => {
      this.user = this.userComponent.user() as User
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
      imageUrl
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
        this._toastrService.success(`PAC.NOTES.USERS.USER_UPDATED`, { name: new CreatedByPipe().transform(this.user) })
      })
    } catch (error) {}
  }
}
