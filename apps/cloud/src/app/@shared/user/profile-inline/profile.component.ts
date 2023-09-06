import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { IUser } from '../../../@core'
import { UserPipe } from "../../pipes"

@Component({
    standalone: true,
    selector: 'pac-user-profile-inline',
    templateUrl: 'profile.component.html',
    styleUrls: ['profile.component.scss'],
    imports: [CommonModule, UserPipe],
    host: {
      class: 'pac-user-profile-inline'
    }
})
export class UserProfileInlineComponent {
  @Input() user?: IUser
}
