import { Component, computed, inject, signal } from '@angular/core'
import { XpertStudioComponent } from '../studio.component'
import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { MaterialModule } from 'apps/cloud/src/app/@shared'
import { getErrorMessage, ToastrService, XpertRoleService } from 'apps/cloud/src/app/@core'
import { sortBy } from 'lodash-es'
import { formatRelative } from 'date-fns'
import { getDateLocale } from '../../../../@core'
import { XpertStudioApiService } from '../domain'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'xpert-studio-header',
  standalone: true,
  imports: [
    CommonModule,
    CdkMenuModule,
    MaterialModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class XpertStudioHeaderComponent {
  readonly xpertStudioComponent = inject(XpertStudioComponent)
  readonly xpertRoleService = inject(XpertRoleService)
  readonly apiService = inject(XpertStudioApiService)
  readonly #toastr = inject(ToastrService)
  readonly #translate = inject(TranslateService)

  readonly team = computed(() => this.xpertStudioComponent.team())
  readonly version = computed(() => this.team()?.version)
  readonly latest = computed(() => this.team()?.latest)
  readonly versions = computed(() => sortBy(this.xpertStudioComponent.versions(), 'version'))
  readonly draft = computed(() => this.apiService.draft())
  readonly draftSavedDate = computed(() => {
    if (this.draft()?.savedAt) {
      return new Date(this.draft().savedAt).toLocaleTimeString()
    }
    return null
  })
  readonly latestPublishDate = computed(() => {
    const publishDate = this.team()?.updatedAt
    if (publishDate) {
      return formatRelative(new Date(publishDate), new Date(), {
        locale: getDateLocale(this.#translate.currentLang)
      })
    }
    return null
  })
  
  readonly publishing = signal(false)

  publish() {
    this.publishing.set(true)
    this.xpertRoleService.publish(this.xpertStudioComponent.id()).subscribe({
        next: (result) => {
            this.#toastr.success(`PAC.Messages.Saved`, {}, `Version ${result.version}`)
        },
        error: (error) => {
            this.#toastr.error(getErrorMessage(error))
        }
    })
  }

  resume() {
    this.apiService.resume()
  }
}
