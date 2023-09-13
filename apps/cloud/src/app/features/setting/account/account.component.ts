import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MatDividerModule } from '@angular/material/divider'
import { MatTabsModule } from '@angular/material/tabs'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { Store } from '../../../@core'
import { UserAvatarEditorComponent, UserPipe } from '../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  imports: [
    CommonModule,
    MatTabsModule,
    MatDividerModule,
    TranslateModule,
    RouterModule,
    UserPipe,
    UserAvatarEditorComponent
  ]
})
export class PACAccountComponent {
  private readonly store = inject(Store)

  public readonly user = toSignal(this.store.user$)
}
