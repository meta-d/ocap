import { CommonModule } from '@angular/common'
import { Component, effect, inject, signal } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { Indicator, convertIndicatorResult } from '@metad/cloud/state'
import { saveAsYaml, uploadYamlFile } from '@metad/core'
import { ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateModule } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { routeAnimations } from '../../../@core'
import { MaterialModule } from '../../../@shared'
import { TranslationBaseComponent } from '../../../@shared/language/translation-base.component'
import { ProjectComponent } from '../project.component'
import { exportIndicator } from '../types'
import { IndicatorImportComponent } from './indicator-import/indicator-import.component'

@UntilDestroy()
@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MaterialModule, ButtonGroupDirective, DensityDirective],
  selector: 'pac-project-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss'],
  animations: [routeAnimations]
})
export class ProjectIndicatorsComponent extends TranslationBaseComponent {
  private projectComponent = inject(ProjectComponent)
  private _dialog = inject(MatDialog)
  private router = inject(Router)
  private _route = inject(ActivatedRoute)

  get indicators() {
    return this.projectComponent.project?.indicators
  }

  selectedIndicators = []

  openedIndicators = signal([])
  currentIndicator = signal(null)

  constructor() {
    super()

    effect(() => {
      if (this.currentIndicator()) {
        if (!this.openedIndicators().find((item) => item.id === this.currentIndicator().id)) {
          this.openedIndicators.set([...this.openedIndicators(), this.currentIndicator()])
        }
      }
    }, {allowSignalWrites: true})
  }

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
    }
  }

  setCurrentIndicator(indicator: Indicator) {
    this.currentIndicator.set(indicator)
  }

  replaceNewIndicator(indicator: Indicator) {
    const index = this.openedIndicators().findIndex((item) => item.id === 'new')
    if (index > -1) {
      this.openedIndicators().splice(index, 1, indicator)
    }
    this.currentIndicator.set(indicator)
  }

  removeOpenedIndicator(indicator: Indicator) {
    this.currentIndicator.set(null)
    this.openedIndicators.set(this.openedIndicators().filter((item) => item.id !== indicator.id))
    this.router.navigate(['.'], {relativeTo: this._route})
  }
}
