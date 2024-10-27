import { Component, computed, input } from '@angular/core'
import { IXpert } from '../../../@core'
import { EmojiAvatarComponent } from '../../avatar'


@Component({
  standalone: true,
  selector: 'xpert-inline-profile',
  template: `<emoji-avatar [avatar]="avatar()" class="xpert-avatar shrink-0 overflow-hidden rounded-lg shadow-sm" />
  <span class="xpert-title">{{xpert().title}}</span>`,
  styleUrl: 'inline-xpert.component.scss',
  imports: [EmojiAvatarComponent]
})
export class XpertInlineProfileComponent {
  readonly xpert = input<IXpert>()
  readonly avatar = computed(() => this.xpert()?.avatar ?? {
    emoji: {
      id: '🤖'
    },
    background: 'rgb(213, 245, 246)'
  })
}