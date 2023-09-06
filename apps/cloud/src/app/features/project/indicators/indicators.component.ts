import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { Indicator } from '@metad/ocap-core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateModule } from '@ngx-translate/core'
import { convertIndicatorResult } from '@metad/cloud/state'
import { firstValueFrom } from 'rxjs'
import { MaterialModule } from '../../../@shared'
import { ProjectComponent } from '../project.component'
import { MatDialog } from '@angular/material/dialog'
import { IndicatorImportComponent } from './indicator-import/indicator-import.component'
import { saveAsYaml, uploadYamlFile } from '@metad/core'
import { TranslationBaseComponent } from '../../../@shared/language/translation-base.component'
import { exportIndicator } from '../types'

@UntilDestroy()
@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MaterialModule,
    ButtonGroupDirective,
    DensityDirective,
  ],
  selector: 'pac-project-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss']
})
export class ProjectIndicatorsComponent extends TranslationBaseComponent {
  private projectComponent = inject(ProjectComponent)
  private _dialog = inject(MatDialog)

  get indicators() {
    return this.projectComponent.project?.indicators
  }

  selectedIndicators = []

  
  async export() {
    const indicators = this.selectedIndicators.length ? this.selectedIndicators : this.indicators
    const indicatorsFileName = this.getTranslation('PAC.INDICATOR.Indicators', { Default: 'Indicators' })
    saveAsYaml(`${indicatorsFileName}.yaml`, indicators.map((item) => exportIndicator(convertIndicatorResult(item))))
  }

  async handleUploadChange(event) {
    const indicators = await uploadYamlFile<Indicator[]>(event.target.files[0])

    const results = await firstValueFrom(this._dialog.open(IndicatorImportComponent, {
      data: {
        indicators,
        models: this.projectComponent.project.models,
        certifications: this.projectComponent.project.certifications,
        projectId: this.projectComponent.project?.id
      }}).afterClosed())
    if (results) {
      // 下载上传结果
      saveAsYaml(`${this.getTranslation('PAC.INDICATOR.IndicatorImportResults', { Default: 'Indicator_Import_Results' })}.yml`, results)
      this.projectComponent.refreshIndicators()
    }
  }

}
