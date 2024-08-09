import { Component, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { DisplayBehaviour, formatNumber } from '@metad/ocap-core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { CopilotUsageService, ICopilotOrganization, ToastrService } from '../../../../@core'
import { MaterialModule, OrgAvatarComponent, TranslationBaseComponent } from '../../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-copilot-usages',
  templateUrl: './usages.component.html',
  styleUrls: ['./usages.component.scss'],
  imports: [RouterModule, TranslateModule, MaterialModule, FormsModule, ReactiveFormsModule, NgmCommonModule, OrgAvatarComponent]
})
export class CopilotUsagesComponent extends TranslationBaseComponent {
  DisplayBehaviour = DisplayBehaviour

  readonly usageService = inject(CopilotUsageService)
  readonly _toastrService = inject(ToastrService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly dialog = inject(MatDialog)
  readonly translate = inject(TranslateService)

  readonly usages = signal<ICopilotOrganization[]>([])

  private dataSub = this.usageService
    .getOrgUsages()
    .pipe(takeUntilDestroyed())
    .subscribe((usages) => {
      this.usages.set(usages)
    })

  _formatNumber(value: number): string {
    return formatNumber(value, this.translate.currentLang, '0.0-0')
  }
  formatNumber = this._formatNumber.bind(this)
}
