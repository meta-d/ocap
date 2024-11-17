import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatTooltipModule } from '@angular/material/tooltip'
import { NgmSpinComponent } from '@metad/ocap-angular/common'
import { NgmDensityDirective, NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { getErrorMessage, ICopilotProviderModel, injectAiProviders, injectCopilotProviderService, ToastrService } from '../../../@core'
import { derivedAsync } from 'ngxtension/derived-async'
import { Dialog } from '@angular/cdk/dialog'
import { CopilotProviderModelComponent } from '../copilot-provider-model/model.component'
import { BehaviorSubject, switchMap } from 'rxjs'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'

@Component({
  standalone: true,
  selector: 'copilot-provider',
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    DragDropModule,
    MatTooltipModule,
    MatInputModule,
    MatSlideToggleModule,
    NgmDensityDirective,
    NgmI18nPipe,
    NgmSpinComponent
  ],
  host: {
    '[style.background]': 'background()'
  }
})
export class CopilotProviderComponent {
  readonly #dialog = inject(Dialog)
  readonly #translate = inject(TranslateService)
  readonly #toastr = inject(ToastrService)
  readonly #copilotProviderService = injectCopilotProviderService()
  readonly aiProviders = injectAiProviders()

  // Inputs
  readonly providerId = input<string>()

  // Outputs
  readonly deleted = output<void>()

  readonly refresh$ = new BehaviorSubject<void>(null)
  readonly showModels = signal(false)
  readonly copilotProvider = derivedAsync(() => {
    return this.providerId() ? 
      this.refresh$.pipe(switchMap(() => this.#copilotProviderService.getOneById(this.providerId())))
      : null
  })

  readonly background = computed(() => this.copilotProvider()?.provider?.background ?? 'transparent')
  readonly icon = computed(() => this.copilotProvider()?.provider?.icon_large)
  readonly smallIcon = computed(() => this.copilotProvider()?.provider?.icon_small)

  // readonly models = computed(() => this.copilotProvider()?.models ?? [])
  readonly #models = derivedAsync(() => {
    return this.showModels() ? 
      this.refresh$.pipe(switchMap(() => this.#copilotProviderService.getModels(this.providerId()))) : null
  })

  readonly customModels = computed(() => this.#models()?.custom)
  readonly builtinModels = computed(() => this.#models()?.builtin)

  readonly modelCount = computed(() => (this.customModels()?.length ?? 0) + (this.builtinModels()?.length ?? 0))

  readonly loading = signal(false)

  readonly isShowModels = signal(false)

  constructor() {
    effect(() => {
      console.log(this.#models())
    })
  }

  toggleShowModels() {
    this.isShowModels.update((state) => !state)
    if (this.isShowModels()) {
      this.showModels.set(true)
    }
  }

  delete() {
    this.loading.set(true)
    this.#copilotProviderService.delete(this.providerId()).subscribe({
      next: (copilotProvider) => {
        this.loading.set(false)
        this.#toastr.success('PAC.Messages.DeletedSuccessfully', { Default: 'Deleted successfully' })
        this.deleted.emit()
      },
      error: (err) => {
        this.loading.set(false)
        this.#toastr.error(getErrorMessage(err))
      }
    })
  }

  addModel() {
    this.#dialog.open(CopilotProviderModelComponent, {
      data: {
        provider: this.copilotProvider(),
        modelId: null
      }
    }).closed.subscribe({
      next: (result) => {
        if (result) {
          this.refresh$.next()
        }
      }
    })
  }

  editModel(model: ICopilotProviderModel) {
    this.#dialog.open(CopilotProviderModelComponent, {
      data: {
        provider: this.copilotProvider(),
        modelId: model.id
      }
    }).closed.subscribe({
      next: (result) => {
        if (result) {
          this.refresh$.next()
        }
      }
    })
  }
  
}
