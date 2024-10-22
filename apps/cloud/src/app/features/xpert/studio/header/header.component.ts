import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { Component, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { nonBlank } from '@metad/ocap-angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { getErrorMessage, ToastrService, XpertService } from 'apps/cloud/src/app/@core'
import { MaterialModule } from 'apps/cloud/src/app/@shared'
import { formatRelative } from 'date-fns'
import { sortBy } from 'lodash-es'
import { getDateLocale } from '../../../../@core'
import { XpertStudioApiService } from '../domain'
import { XpertStudioComponent } from '../studio.component'

@Component({
  selector: 'xpert-studio-header',
  standalone: true,
  imports: [CommonModule, CdkMenuModule, MaterialModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class XpertStudioHeaderComponent {
  readonly xpertStudioComponent = inject(XpertStudioComponent)
  readonly xpertRoleService = inject(XpertService)
  readonly apiService = inject(XpertStudioApiService)
  readonly #toastr = inject(ToastrService)
  readonly #translate = inject(TranslateService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)

  readonly team = computed(() => this.xpertStudioComponent.team())
  readonly version = computed(() => this.team()?.version)
  readonly latest = computed(() => this.team()?.latest)
  readonly versions = computed(() => {
    const versions = this.apiService.versions()?.filter(nonBlank)
    return sortBy(versions, 'version').reverse()
  })
  readonly draft = computed(() => this.apiService.draft())
  readonly unsaved = this.apiService.unsaved
  readonly draftSavedDate = computed(() => {
    if (this.draft()?.savedAt) {
      return new Date(this.draft().savedAt).toLocaleTimeString()
    }
    return null
  })
  readonly latestPublishDate = computed(() => {
    const publishDate = this.team()?.publishAt
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
        this.#toastr.success(
          `PAC.Xpert.PublishedSuccessfully`,
          { Default: 'Published successfully' },
          `v${result.version}`
        )
        this.publishing.set(false)
        this.apiService.refresh()
      },
      error: (error) => {
        this.#toastr.error(getErrorMessage(error))
        this.publishing.set(false)
      }
    })
  }

  resume() {
    this.apiService.resume()
  }

  selectVersion(id: string) {
    this.router.navigate(['..', id], { relativeTo: this.route })
  }
}
