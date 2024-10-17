import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { Component, computed, effect, inject, input, model } from '@angular/core'
import { ICopilotModel, ModelType, PACCopilotService } from '../../../@core'
import { NgmSearchComponent } from '@metad/ocap-angular/common'
import { derivedAsync } from 'ngxtension/derived-async'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { NgmI18nPipe } from '@metad/ocap-angular/core'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CdkMenuModule,
    CdkListboxModule,
    NgmSearchComponent,
    NgmI18nPipe
  ],
  selector: 'copilot-model-select',
  templateUrl: 'select.component.html',
  styleUrls: ['select.component.scss']
})
export class CopilotModelSelectComponent {
  readonly copilotService = inject(PACCopilotService)
  
  readonly modelType = input<ModelType>()
  readonly inheritModel = input<ICopilotModel>()
  readonly copilotModel = model<ICopilotModel>()

  readonly _copilotModel = computed(() => this.copilotModel() ?? this.inheritModel())

  readonly copilotWithModels = derivedAsync(() => {
    return this.copilotService.getCopilotModels(this.modelType())
  })

  constructor() {
    effect(() => {
      console.log(this.copilotWithModels())
    })
  }

  setModel(model: string) {
    this.copilotModel.set({
      ...(this._copilotModel() ?? {}),
      model
    })
  }
}
