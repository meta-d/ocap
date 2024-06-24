import { CommonModule } from '@angular/common'
import { Component, computed, inject, signal } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { RouterModule } from '@angular/router'
import { Indicator, convertIndicatorResult } from '@metad/cloud/state'
import { CommandDialogComponent } from '@metad/copilot-angular'
import { saveAsYaml, uploadYamlFile } from '@metad/core'
import { NgmConfirmDeleteComponent } from '@metad/ocap-angular/common'
import { ButtonGroupDirective, DensityDirective, NgmDSCoreService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { EntityType } from '@metad/ocap-core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import { IIndicator, ISemanticModel, routeAnimations } from '../../../@core'
import { ManageEntityBaseComponent, MaterialModule } from '../../../@shared'
import { ProjectService } from '../project.service'
import { exportIndicator, injectFetchModelDetails } from '../types'
import { IndicatorImportComponent } from './indicator-import/indicator-import.component'

export const NewIndicatorCodePlaceholder = 'new'

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MaterialModule, ButtonGroupDirective, DensityDirective],
  selector: 'pac-project-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss'],
  animations: [routeAnimations]
})
export class ProjectIndicatorsComponent extends ManageEntityBaseComponent<IIndicator> {
  NewIndicatorCodePlaceholder = NewIndicatorCodePlaceholder

  private projectService = inject(ProjectService)
  private _dialog = inject(MatDialog)
  readonly #logger = inject(NGXLogger)
  readonly #translate = inject(TranslateService)
  readonly dsCoreService = inject(NgmDSCoreService)
  readonly wasmAgent = inject(WasmAgentService)
  readonly fetchModelDetails = injectFetchModelDetails()

  readonly selectedIndicators = signal<IIndicator[]>([])
  readonly models = this.projectService.models
  readonly dataSources = computed(() =>
    this.models().map((model) => ({
      key: model.key,
      caption: model.name
    }))
  )
  readonly modelDetails = signal<Record<string, ISemanticModel>>({})
  readonly currentDataSource = signal<string | null>(null)
  readonly currentEntityType = signal<EntityType | null>(null)

  isDirty(id: string) {
    return this.projectService.dirty()[id]
  }

  async removeOpenedLink(link: IIndicator) {
    if (this.isDirty(link.id)) {
      const confirm = await firstValueFrom(this._dialog
        .open(NgmConfirmDeleteComponent, {
          data: {
            title: this.getTranslation('PAC.ACTIONS.Close', {Default: 'Close'}) + ` [${link.name}]`,
            value: link.name,
            information: this.getTranslation('PAC.INDICATOR.IndicatorHasUnsavedChanges', {Default: `There are unsaved changes in the indicator.\n Are you sure to close it?`})
          }
        })
        .afterClosed())
        if (!confirm) {
          return
        }
    }

    this.projectService.resetIndicator(link.id)
    super.removeOpenedLink(link)
  }

  async export() {
    const project = this.projectService.project()
    const indicators = this.selectedIndicators().length ? this.selectedIndicators() : project.indicators
    const indicatorsFileName = this.getTranslation('PAC.INDICATOR.Indicators', { Default: 'Indicators' })
    saveAsYaml(
      `${indicatorsFileName}.yaml`,
      indicators.map((item) => exportIndicator(convertIndicatorResult(item)))
    )
  }

  async handleUploadChange(event) {
    const indicators = await uploadYamlFile<Indicator[]>(event.target.files[0])
    const project = this.projectService.project()
    const results = await firstValueFrom(
      this._dialog
        .open(IndicatorImportComponent, {
          data: {
            indicators,
            models: project.models,
            certifications: project.certifications,
            projectId: project?.id
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
      this.projectService.refreshIndicators()

      this.router.navigate(['.'], { relativeTo: this.route })
    }
  }

  replaceNewIndicator(indicator: Indicator) {
    const index = this.openedLinks().findIndex((item) =>
      item.code ? item.code === indicator.code : item.id === NewIndicatorCodePlaceholder
    )
    if (index > -1) {
      this.openedLinks().splice(index, 1, indicator)
    }
    this.currentLink.set(indicator)
  }

  aiRegister() {
    this._dialog
      .open(CommandDialogComponent, {
        backdropClass: 'bg-transparent',
        data: {
          commands: ['indicator']
        }
      })
      .afterClosed()
      .subscribe((result) => {})
  }
}
