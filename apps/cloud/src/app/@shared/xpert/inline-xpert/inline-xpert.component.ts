import { Component, input } from '@angular/core'
import { IXpert } from '../../../@core'
import { AvatarComponent } from '../../files'

@Component({
  standalone: true,
  selector: 'xpert-inline-profile',
  template: `<pac-avatar [avatar]="xpert()?.avatar" class="xpert-avatar shrink-0 mr-2 w-6 h-6 overflow-hidden rounded-full" /><span class="xpert-title">{{xpert().title}}</span>`,
  styleUrl: 'inline-xpert.component.scss',
  imports: [AvatarComponent]
})
export class XpertInlineProfileComponent {
  readonly xpert = input<IXpert>()
}
