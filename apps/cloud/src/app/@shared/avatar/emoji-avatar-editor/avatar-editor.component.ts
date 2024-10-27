import { CdkListboxModule } from '@angular/cdk/listbox'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { PickerComponent } from '@ctrl/ngx-emoji-mart'
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { pick } from 'lodash-es'
import { firstValueFrom } from 'rxjs'
import { ScreenshotService, TAvatar } from '../../../@core'
import { MaterialModule } from '../../material.module'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'emoji-avatar-editor',
  templateUrl: './avatar-editor.component.html',
  styleUrl: './avatar-editor.component.scss',
  imports: [
    CommonModule,
    MatIconModule,
    CdkListboxModule,
    TranslateModule,
    MaterialModule,
    ButtonGroupDirective,
    DensityDirective,
    AppearanceDirective,
    PickerComponent,
    EmojiComponent
  ],
})
export class EmojiAvatarEditorComponent {
  readonly screenshotService = inject(ScreenshotService)
  readonly #dialogRef = inject(MatDialogRef)
  readonly avatar = inject<TAvatar>(MAT_DIALOG_DATA)

  // readonly value = signal<string | null>(null)
  readonly disabled = signal<boolean>(false)
  readonly type = model<'emoji' | 'image'>('emoji')

  readonly background = model<string>('rgb(213, 245, 246)')
  readonly emoji = model<TAvatar['emoji']>()

  readonly colors = [
    "rgb(255, 234, 213)",
    "rgb(228, 251, 204)",
    "rgb(211, 248, 223)",
    "rgb(224, 242, 254)",
    "rgb(224, 234, 255)",
    "rgb(239, 241, 245)",
    "rgb(251, 232, 255)",
    "rgb(252, 231, 246)",
    "rgb(254, 247, 195)",
    "rgb(230, 244, 215)",
    "rgb(213, 245, 246)",
    "rgb(209, 233, 255)",
    "rgb(209, 224, 255)",
    "rgb(213, 217, 235)",
    "rgb(236, 233, 254)",
    "rgb(255, 228, 232)"
  ]

  readonly sets = [
    null, 'apple', 'google', 'twitter', 'facebook'
  ]

  readonly set = model<TAvatar['emoji']['set']>(null)

  readonly imageUrl = signal<string>(null)

  private onChange: (value: string | null) => void
  private onTouched: (value: string | null) => void

  constructor() {
    effect(
      () => {
        if (this.avatar) {
          this.background.set(this.avatar.background)
          this.emoji.set(this.avatar.emoji)
          this.set.set(this.avatar.emoji?.set)
          this.imageUrl.set(this.avatar.url)
        }
      },
      { allowSignalWrites: true }
    )
  }

  async uploadAvatar(event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    const screenshot = await this.uploadScreenshot(file!)
    this.imageUrl.set(screenshot.url)
    this.emoji.set(null)
  }

  async uploadScreenshot(fileUpload: File) {
    const formData = new FormData()
    formData.append('file', fileUpload)
    return await firstValueFrom(this.screenshotService.create(formData))
  }

  addEmoji(event: { emoji: any }) {
    this.emoji.set(pick(event.emoji, 'id', 'set', 'colons', 'unified'))
  }

  apply() {
    this.#dialogRef.close({
      emoji: this.emoji(),
      background: this.background(),
      url: this.imageUrl()
    })
  }
}
