import { CommonModule } from '@angular/common'
import { Component, computed, inject, signal } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { RouterModule } from '@angular/router'
import { Indicator, NgmSemanticModel, convertIndicatorResult } from '@metad/cloud/state'
import {
  saveAsYaml,
  uploadYamlFile,
} from '@metad/core'
import { CommandDialogComponent } from '@metad/copilot-angular'
import { ButtonGroupDirective, DensityDirective, NgmDSCoreService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { EntityType } from '@metad/ocap-core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom } from 'rxjs'
import { IIndicator, ISemanticModel, routeAnimations } from '../../../@core'
import { ManageEntityBaseComponent, MaterialModule } from '../../../@shared'
import { exportIndicator, injectFetchModelDetails } from '../types'
import { IndicatorImportComponent } from './indicator-import/indicator-import.component'
import { ProjectService } from '../project.service'


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

//   #createIndicator = injectCopilotCommand({
//     name: 'iiii',
//     description: this.#translate.instant('PAC.INDICATOR.Copilot_CreateIndicator', {Default: 'Create a new indicator'}),
//     systemPrompt: async () => {
//       let prompt = `你是一名 BI 指标体系管理的业务专家，请根据指定的 Cube 信息和需求描述转成相应的参数调用 create_indicator 函数进行创建新指标。
// 将未限定成员的可以自由选择的维度都加入到 dimensions 中，选择一个 calendar 维度加入到 calendar 中，将必要的限定成员加入到 filters 属性中。
// 如果未提供 Cube 信息或者需要重新选择 Cube 时请调用 pick_default_cube 函数。
// `
//       if (this.currentEntityType()) {
//         prompt += `当前选择的 Cube 信息为:
// \`\`\`
// ${calcEntityTypePrompt(this.currentEntityType())}
// \`\`\`
// `
//       }
//       return prompt
//     },
//     actions: [
//       injectPickDefaultCubeAction(async () => {
//         const dataSources = this.dataSources()
//         const result = await firstValueFrom<EntitySelectResultType>(
//           this._dialog
//             .open<NgmEntityDialogComponent, EntitySelectDataType, EntitySelectResultType>(NgmEntityDialogComponent, {
//               data: {
//                 dataSources,
//                 dsCoreService: this.dsCoreService,
//                 registerModel: async (modelKey) => {
//                   if (modelKey && !this.modelDetails()[modelKey]) {
//                     const semanticModel = await firstValueFrom(
//                       this.fetchModelDetails(
//                         this.projectService.models().find((item) => item.key === modelKey).id
//                       )
//                     )

//                     registerModel(semanticModel as NgmSemanticModel, this.dsCoreService, this.wasmAgent)
//                   }
//                 }
//               }
//             })
//             .afterClosed()
//         )

//         if (result?.dataSource && result?.entities[0]) {
//           this.currentDataSource.set(this.models().find((item) => item.key === result.dataSource)?.id)
//           const entitySet = await firstValueFrom(
//             this.dsCoreService.selectEntitySet(result.dataSource, result.entities[0])
//           )
//           if (isEntitySet(entitySet)) {
//             this.currentEntityType.set(entitySet.entityType)
//             return {
//               dataSource: result.dataSource,
//               entityType: entitySet.entityType
//             }
//           }
//         }
//         return null
//       }),
//       injectMakeCopilotActionable({
//         name: 'create_indicator',
//         description: 'Create a new indicator',
//         argumentAnnotations: [
//           {
//             name: 'indicator',
//             type: 'object',
//             description: 'Provide the new indicator',
//             properties: zodToProperties(IndicatorSchema),
//             required: true
//           }
//         ],
//         implementation: async (indicator: Partial<Indicator>) => {
//           this.#logger.debug(`Copilot command 'i' params: indicator is`, indicator)

//           this.router.navigate(['new'], { relativeTo: this.route, state: {
//             ...indicator,
//             modelId: this.currentDataSource(),
//             entity: this.currentEntityType().name
//           }})
//           return `✅`
//         }
//       })
//     ]
//   })

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
    const index = this.openedLinks().findIndex((item) => item.code ? item.code === indicator.code : item.id === NewIndicatorCodePlaceholder)
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
