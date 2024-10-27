import { CommonModule } from '@angular/common'
import { booleanAttribute, Component, computed, HostBinding, HostListener, inject, input, model } from '@angular/core'
import { TAvatar } from '../../../@core'
import { MatDialog } from '@angular/material/dialog'
import { EmojiAvatarEditorComponent } from '../emoji-avatar-editor/avatar-editor.component'
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji'

@Component({
  standalone: true,
  imports: [ CommonModule, EmojiComponent ],
  selector: 'emoji-avatar',
  template: `@if (avatar()?.url) {
      <img class="" [src]="avatar().url" [alt]="alt()" />
    } @else {
      <div class="flex justify-center items-center w-full h-full" [ngStyle]="{ background: emoji().background }">
        <ngx-emoji class="flex" [emoji]="emoji().emoji.id" [set]="emoji().emoji.set" [isNative]="!emoji().emoji.set" [size]="size()"/>
      </div>
    }`,
  styleUrl: 'avatar.component.scss',
  host: {
    '[class.small]': 'small()',
    '[class.large]': 'large()',
    '[class.cursor-pointer]': 'editable()',
  },
})
export class EmojiAvatarComponent {
  readonly dialog = inject(MatDialog)

  readonly alt = input<string>()
  readonly avatar = model<TAvatar>()

  readonly editable = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })
  readonly small = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  readonly large = input<boolean, string | boolean>(false, {
    transform: booleanAttribute
  })

  readonly emoji = computed(
    () =>
      this.avatar() ?? {
        emoji: {
          id: 'robot_face'
        },
        background: 'rgb(213, 245, 246)'
      }
  )

  readonly size = computed(() => this.large() ? 24 : this.small() ? 16 : 18)

  @HostListener('click')
  onClick() {
    if (this.editable()) {
      this.dialog.open(EmojiAvatarEditorComponent, {
        data: this.avatar()
      }).afterClosed().subscribe({
        next: (result) => {
          if (result) {
            this.avatar.set(result)
          }
        }
      })
    }
  }
}
