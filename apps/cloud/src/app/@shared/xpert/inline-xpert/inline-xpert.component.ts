import { Component, computed, input } from '@angular/core'
import { IXpert } from '../../../@core'
import { EmojiAvatarComponent } from '../../avatar'


@Component({
  standalone: true,
  selector: 'xpert-inline-profile',
  template: `<emoji-avatar [avatar]="avatar()" small class="xpert-avatar shrink-0 overflow-hidden rounded-lg shadow-sm mr-1" />
  <span class="xpert-title truncate" [title]="xpert().title || xpert().name">{{xpert().title || xpert().name}}</span>`,
  styleUrl: 'inline-xpert.component.scss',
  imports: [EmojiAvatarComponent]
})
export class XpertInlineProfileComponent {
  readonly xpert = input<IXpert>()
  readonly avatar = computed(() => this.xpert()?.avatar)
}
