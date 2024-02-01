import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, inject } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { Store, UsersService } from '@metad/cloud/state'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { IUser, ScreenshotService } from '../../../@core'
import { UserPipe } from '../../pipes'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-user-avatar-editor',
  templateUrl: './avatar-editor.component.html',
  styles: [``],
  imports: [
    CommonModule,
    MatIconModule,
    CdkMenuModule,
    TranslateModule,
    UserPipe,
    DensityDirective,
    AppearanceDirective
  ]
})
export class UserAvatarEditorComponent {
  readonly #store = inject(Store)
  private readonly screenshotService = inject(ScreenshotService)
  private readonly userService = inject(UsersService)
  private readonly _cdr = inject(ChangeDetectorRef)

  @Input() user?: IUser

  @Output() userChange = new EventEmitter<IUser>()

  async uploadAvatar(event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    const screenshot = await this.uploadScreenshot(file)
    const user = await firstValueFrom(this.userService.updateMe({ imageUrl: screenshot.url }))
    this.user = user
    this._cdr.detectChanges()
    this.userChange.emit(user)
    this.#store.user = {
      ...this.#store.user,
      imageUrl: screenshot.url
    }
  }

  async uploadScreenshot(fileUpload: File) {
    const formData = new FormData()
    formData.append('file', fileUpload)
    return await firstValueFrom(this.screenshotService.create(formData))
  }

  async remove() {
    const user = await firstValueFrom(this.userService.updateMe({ imageUrl: null }))
    this.user = user
    this._cdr.detectChanges()
    this.userChange.emit(user)
    this.#store.user = {
      ...this.#store.user,
      imageUrl: null
    }
  }
}
