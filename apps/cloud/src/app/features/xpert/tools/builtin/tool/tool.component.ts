import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, model, output, signal } from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTooltipModule } from '@angular/material/tooltip'
import { routeAnimations } from '@metad/core'
import { NgmDensityDirective, NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { IBuiltinTool, TagCategoryEnum, XpertToolsetService } from 'apps/cloud/src/app/@core'
import { EmojiAvatarComponent } from 'apps/cloud/src/app/@shared/avatar'
import { XpertToolBuiltinParametersComponent } from '../parameters/parameters.component'


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
    XpertToolBuiltinParametersComponent
  ],
  selector: 'xpert-tool-builtin-tool',
  templateUrl: './tool.component.html',
  styleUrl: 'tool.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertToolBuiltinToolComponent {

  readonly toolsetService = inject(XpertToolsetService)
  readonly #formBuilder = inject(FormBuilder)
  readonly #dialog = inject(MatDialog)
  readonly #cdr = inject(ChangeDetectorRef)

  readonly tool = input<IBuiltinTool>()
  readonly disabled = input<boolean>(false)
  readonly enabled = model<boolean>()

  readonly expand = model<boolean>(false)

  toggleExpand() {
    if (!this.disabled()) {
      this.expand.update((state) => !state)
    }
  }
}
