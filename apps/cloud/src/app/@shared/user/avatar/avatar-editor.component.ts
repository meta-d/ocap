import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core'
import { Store, UsersService } from '@metad/cloud/state'
import { TranslateModule } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { IUser } from '../../../@core'
import { AvatarEditorComponent } from '../../files'
import { UserPipe } from '../../pipes'

/**
 */
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-user-avatar-editor',
  templateUrl: './avatar-editor.component.html',
  styles: [``],
  imports: [CommonModule, TranslateModule, UserPipe, AvatarEditorComponent]
})
export class UserAvatarEditorComponent {
  readonly #store = inject(Store)
  private readonly userService = inject(UsersService)

  @Input() user?: IUser

  @Output() userChange = new EventEmitter<IUser>()

  async onUrlChange(event: string) {
    const user = await firstValueFrom(this.userService.updateMe({ imageUrl: event }))
    this.user = user
    this.userChange.emit(user)
    this.#store.user = {
      ...this.#store.user,
      imageUrl: null
    }
  }
}
