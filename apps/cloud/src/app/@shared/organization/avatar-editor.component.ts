import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, Input, inject } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { IOrganization, OrganizationsService, ScreenshotService } from '../../@core'
import { UserPipe } from '../pipes'

@Component({
  standalone: true,
  selector: 'pac-org-avatar-editor',
  templateUrl: './avatar-editor.component.html',
  styles: [``],
  imports: [CommonModule, MatIconModule, CdkMenuModule, TranslateModule, UserPipe, DensityDirective, AppearanceDirective]
})
export class OrgAvatarEditorComponent {
  private readonly screenshotService = inject(ScreenshotService)
  private readonly orgService = inject(OrganizationsService)
  private readonly _cdr = inject(ChangeDetectorRef)

  @Input() org?: IOrganization

  async uploadAvatar(event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    const screenshot = await this.uploadScreenshot(file)
    const org = await firstValueFrom(this.orgService.update(this.org.id, { imageUrl: screenshot.url }))
    this.org = org
    this._cdr.detectChanges()
  }

  async uploadScreenshot(fileUpload: File) {
    const formData = new FormData()
    formData.append('file', fileUpload)
    return await firstValueFrom(this.screenshotService.create(formData))
  }

  async remove() {
    this.org = await firstValueFrom(this.orgService.update(this.org.id, { imageUrl: null }))
    this._cdr.detectChanges()
  }
}
