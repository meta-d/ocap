import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { IUser } from '../../../@core'
import { UserPipe } from "../../pipes"

@Component({
    standalone: true,
    selector: 'pac-user-avatar',
    template: `<img class="" [src]="user?.imageUrl || '/assets/images/avatar-default.svg'" alt="{{user | user}}"/>`,
    styles: [``],
    imports: [CommonModule, UserPipe]
})
export class UserAvatarComponent {
  @Input() user?: IUser
}
