import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, Input, inject } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { UsersService } from '@metad/cloud/state'
import { firstValueFrom } from 'rxjs'
import { IUser, ScreenshotService } from '../../../@core'
import { UserPipe } from '../../pipes'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  standalone: true,
  selector: 'pac-user-avatar-editor',
  templateUrl: './avatar-editor.component.html',
  styles: [``],
  imports: [CommonModule, MatIconModule, CdkMenuModule, TranslateModule, UserPipe, DensityDirective, AppearanceDirective]
})
export class UserAvatarEditorComponent {
  private readonly screenshotService = inject(ScreenshotService)
  private readonly userService = inject(UsersService)
  private readonly _cdr = inject(ChangeDetectorRef)

  @Input() user?: IUser

  async uploadAvatar(event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    const screenshot = await this.uploadScreenshot(file)
    const user = await firstValueFrom(this.userService.updateMe({ imageUrl: screenshot.url }))
    this.user = user
    this._cdr.detectChanges()
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
  }
}
