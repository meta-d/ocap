import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { Component, computed, effect, inject, input, model } from '@angular/core'
import { ICopilot, ICopilotModel, ModelFeature, ModelType, PACCopilotService } from '../../../@core'
import { NgmHighlightDirective, NgmSearchComponent } from '@metad/ocap-angular/common'
import { derivedAsync } from 'ngxtension/derived-async'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { NgmI18nPipe, nonBlank } from '@metad/ocap-angular/core'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { debounceTime } from 'rxjs'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSliderDragEvent, MatSliderModule } from '@angular/material/slider'
import { MatSelectModule } from '@angular/material/select'
import { NgxFloatUiModule, NgxFloatUiPlacements, NgxFloatUiTriggers } from 'ngx-float-ui'
import { MatInputModule } from '@angular/material/input'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CdkMenuModule,
    CdkListboxModule,
    MatTooltipModule,
    MatSliderModule,
    MatSelectModule,
    MatInputModule,
    NgmSearchComponent,
    NgmI18nPipe,
    NgmHighlightDirective,
  ],
  selector: 'copilot-model-select',
  templateUrl: 'select.component.html',
  styleUrls: ['select.component.scss']
})
export class CopilotModelSelectComponent {
  eNgxFloatUiTriggers = NgxFloatUiTriggers
  eNgxFloatUiPlacements = NgxFloatUiPlacements
  eModelFeature = ModelFeature

  readonly copilotService = inject(PACCopilotService)
  
  readonly modelType = input<ModelType>()
  readonly inheritModel = input<ICopilotModel>()
  readonly copilotModel = model<ICopilotModel>()

  readonly _copilotModel = computed(() => this.copilotModel() ?? this.inheritModel())

  readonly copilotWithModels = derivedAsync(() => {
    return this.copilotService.getCopilotModels(this.modelType())
  })
  readonly copilotWithModels$ = toObservable(this.copilotWithModels)

  readonly searchControl = new FormControl()
  readonly searchText = toSignal(this.searchControl.valueChanges.pipe(debounceTime(300)))
  readonly searchedModels = computed(() => {
    const searchText = this.searchText()
    const copilots = this.copilotWithModels()
    return searchText ? copilots?.map((_) => {
      const models = _.providerWithModels.models.filter((m) => m.model.includes(searchText))
      if (models.length) {
        return {
          ..._,
          providerWithModels: {
            ..._.providerWithModels,
            models
          }
        }
      }
      return null
    }).filter(nonBlank) : copilots
  })

  readonly copilotId = computed(() => this._copilotModel()?.copilotId)
  readonly selectedCopilotWithModels = computed(() => {
    return this.copilotWithModels()?.find((_) => _.id === this.copilotId())
  })

  readonly copilots = this.copilotService.copilots
  readonly provider = computed(() => this.copilots()?.find((_) => _.id === this.copilotId())?.provider)
  readonly model = computed(() => this._copilotModel()?.model)

  readonly modelParameterRules = derivedAsync(() => {
    const provider = this.provider()
    const model = this.model()
    if (provider && model) {
      return this.copilotService.getModelParameterRules(this.provider(), this.model())
    }
    return null
  })

  // constructor() {
  //   effect(() => {
  //     console.log(this.modelParameterRules())
  //   })
  // }

  setModel(copilot: ICopilot, model: string) {
    this.copilotModel.set({
      ...(this._copilotModel() ?? {}),
      model,
      copilotId: copilot.id,
      copilot: copilot,
      modelType: this.modelType()
    })
  }

  getParameter(name: string) {
    return this.copilotModel()?.options?.[name]
  }

  updateParameter(name: string, value: any) {
    this.copilotModel.update((state) => (state ? {
      ...state,
      options: {
        ...(state.options ?? {}),
        [name]: value
      }
    } : {options: {[name]: value}}))
  }

}
