import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { IUser } from '../../../@core'
import { UserPipe } from "../../pipes"

@Component({
    standalone: true,
    selector: 'pac-user-profile-card',
    templateUrl: 'profile.component.html',
    styles: [``],
    imports: [CommonModule, UserPipe]
})
export class UserProfileComponent {
  @Input() user?: IUser
}
