import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  model,
  signal
} from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTooltipModule } from '@angular/material/tooltip'
import { NgmSpinComponent } from '@metad/ocap-angular/common'
import { NgmDensityDirective, NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import {
  getErrorMessage,
  IXpertTool,
  ToastrService,
  XpertToolService,
  XpertToolsetService
} from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'


@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatDialogModule,
    MatTooltipModule,
    MatSlideToggleModule,
    EmojiAvatarComponent,
    NgmI18nPipe,
    NgmDensityDirective,
    NgmSpinComponent
  ],
  selector: 'xpert-toolset-tool-test',
  templateUrl: './tool.component.html',
  styleUrl: 'tool.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertToolsetToolTestComponent {
  readonly toolsetService = inject(XpertToolsetService)
  readonly #formBuilder = inject(FormBuilder)
  readonly #dialog = inject(MatDialog)
  readonly #toastr = inject(ToastrService)
  readonly #cdr = inject(ChangeDetectorRef)
  readonly toolService = inject(XpertToolService)

  readonly tool = input<IXpertTool>()
  readonly disabled = input<boolean>(false)
  readonly enabled = model<boolean>()
  readonly toolId = computed(() => this.tool()?.id)

  readonly toolAvatar = computed(() => this.tool()?.avatar)
  readonly parameter = computed(() => this.tool()?.schema.parameters)

  readonly parameters = model<Record<string, any>>(null)
  readonly testResult = signal(null)

  readonly loading = signal(false)

  updateTool(id: string, value: Partial<IXpertTool>) {}

  saveAsDefault() {
    this.updateTool(this.tool().id, { parameters: this.parameters() })
  }

  onParameter(name: string, event: any) {
    this.parameters.update((state) => ({
      ...(state ?? {}),
      [name]: event
    }))
  }

  testTool() {
    this.loading.set(true)
    this.testResult.set(null)
    this.toolService
      .test({
        ...this.tool(),
        parameters: this.parameters()
      })
      .subscribe({
        next: (result) => {
          this.loading.set(false)
          if (result) {
            this.testResult.set(JSON.stringify(result, null, 4))
          } else {
            this.testResult.set(null)
          }
        },
        error: (error) => {
          this.#toastr.error(getErrorMessage(error))
          this.loading.set(false)
          this.testResult.set(JSON.stringify(getErrorMessage(error), null, 4))
        }
      })
  }
}
