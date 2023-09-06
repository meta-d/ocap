import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { MatTabsModule } from '@angular/material/tabs'
import { RouterModule } from '@angular/router'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateModule } from '@ngx-translate/core'
import { IUser, Store } from '../../../@core'
import { UserAvatarEditorComponent, UserPipe } from '../../../@shared'

@UntilDestroy({ checkProperties: true })
@Component({
    standalone: true,
    selector: 'pac-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    imports: [CommonModule, MatTabsModule, TranslateModule, RouterModule, UserPipe, UserAvatarEditorComponent]
})
export class PACAccountComponent {
  user: IUser

  private _userSub = this.store.user$.subscribe((user) => {
    this.user = user
  })
  constructor(
    private readonly store: Store,
  ) {}
}
