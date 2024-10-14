import { CommonModule } from '@angular/common'
import { Component, input } from '@angular/core'
import { TAvatar } from '../../../@core'

@Component({
    standalone: true,
    selector: 'pac-avatar',
    template: `<img class="" [src]="avatar()?.url || imageUrl() || '/assets/images/avatar-default.svg'" [alt]="alt()" />`,
    styles: [`:host {
  display: flex;
  justify-content: center;
  align-items: center;
}`],
    imports: [CommonModule]
})
export class AvatarComponent {
  readonly imageUrl = input<string>()
  readonly alt = input<string>()
  readonly avatar = input<TAvatar>()
}
