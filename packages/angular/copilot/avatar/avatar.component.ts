import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { IUser } from '../types'

@Component({
  standalone: true,
  selector: 'ngm-copilopt-user-avatar',
  template: `<img class="" [src]="user?.imageUrl || '/assets/images/avatar-default.svg'" alt="{{ user?.name }}" />`,
  imports: [CommonModule]
})
export class UserAvatarComponent {
  @Input() user?: IUser
}
