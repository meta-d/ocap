import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { Component, computed, effect, inject, input, model } from '@angular/core'
import { ICopilot, ICopilotModel, ModelType, PACCopilotService } from '../../../@core'
import { NgmSearchComponent } from '@metad/ocap-angular/common'
import { derivedAsync } from 'ngxtension/derived-async'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { NgmI18nPipe, nonBlank } from '@metad/ocap-angular/core'
import { FormControl } from '@angular/forms'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { debounceTime } from 'rxjs'
import { PopoverClose, PopoverComponent, PopoverTemplate } from '@ngx-popovers/popover'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CdkMenuModule,
    CdkListboxModule,
    PopoverClose,
    PopoverComponent,
    PopoverTemplate,
    NgmSearchComponent,
    NgmI18nPipe,
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

  constructor() {
    effect(() => {
      console.log(this.copilotWithModels())
    })
  }

  setModel(copilot: ICopilot, model: string) {
    this.copilotModel.set({
      ...(this._copilotModel() ?? {}),
      model,
      copilotId: copilot.id,
      modelType: this.modelType()
    })
  }
}
