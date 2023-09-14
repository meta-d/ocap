import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { RouterModule } from '@angular/router'
import { Indicator, convertIndicatorResult } from '@metad/cloud/state'
import { saveAsYaml, uploadYamlFile } from '@metad/core'
import { ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { IIndicator, routeAnimations } from '../../../@core'
import { ManageEntityBaseComponent, MaterialModule } from '../../../@shared'
import { ProjectComponent } from '../project.component'
import { exportIndicator } from '../types'
import { IndicatorImportComponent } from './indicator-import/indicator-import.component'


@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MaterialModule, ButtonGroupDirective, DensityDirective],
  selector: 'pac-project-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss'],
  animations: [routeAnimations]
})
export class ProjectIndicatorsComponent extends ManageEntityBaseComponent<IIndicator> {
  private projectComponent = inject(ProjectComponent)
  private _dialog = inject(MatDialog)

  get indicators() {
    return this.projectComponent.project?.indicators
  }

  selectedIndicators = []

  async export() {
    const indicators = this.selectedIndicators.length ? this.selectedIndicators : this.indicators
    const indicatorsFileName = this.getTranslation('PAC.INDICATOR.Indicators', { Default: 'Indicators' })
    saveAsYaml(
      `${indicatorsFileName}.yaml`,
      indicators.map((item) => exportIndicator(convertIndicatorResult(item)))
    )
  }

  async handleUploadChange(event) {
    const indicators = await uploadYamlFile<Indicator[]>(event.target.files[0])

    const results = await firstValueFrom(
      this._dialog
        .open(IndicatorImportComponent, {
          data: {
            indicators,
            models: this.projectComponent.project.models,
            certifications: this.projectComponent.project.certifications,
            projectId: this.projectComponent.project?.id
          }
        })
        .afterClosed()
    )
    if (results) {
      // 下载上传结果
      saveAsYaml(
        `${this.getTranslation('PAC.INDICATOR.IndicatorImportResults', { Default: 'Indicator_Import_Results' })}.yml`,
        results
      )
      this.projectComponent.refreshIndicators()

      this.router.navigate(['.'], { relativeTo: this.route })
    }
  }

  replaceNewIndicator(indicator: Indicator) {
    const index = this.openedLinks().findIndex((item) => item.id === 'new')
    if (index > -1) {
      this.openedLinks().splice(index, 1, indicator)
    }
    this.currentLink.set(indicator)
  }
}
