import { CommonModule } from '@angular/common'
import { booleanAttribute, Component, computed, input } from '@angular/core'
import { TAvatar } from '../../../@core'

@Component({
  standalone: true,
  selector: 'xpert-avatar',
  template: `@if (avatar()?.url) {
      <img class="" [src]="avatar().url" [alt]="alt()" />
    } @else {
      <div class="flex justify-center items-center w-full h-full" [ngStyle]="{ background: emoji().background }">
        <span>{{ emoji().emoji }}</span>
      </div>
    }`,
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 2.2rem;
        height: 2.2rem;
      }
      :host.small {
        width: 2rem;
        height: 2rem;
      }
      :host.large {
        width: 2.5rem;
        height: 2.5rem;
      }
    `
  ],
  host: {
    '[class.small]': 'small()',
    '[class.large]': 'large()'
  },
  imports: [CommonModule]
})
export class XpertAvatarComponent {
  readonly alt = input<string>()
  readonly avatar = input<TAvatar>()

  readonly small = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  readonly large = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  readonly emoji = computed(
    () =>
      this.avatar() ?? {
        emoji: '🤖',
        background: 'rgb(213, 245, 246)'
      }
  )
}
