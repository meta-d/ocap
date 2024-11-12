import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input } from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTooltipModule } from '@angular/material/tooltip'
import { routeAnimations } from '@metad/core'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { IBuiltinTool, XpertToolsetService } from 'apps/cloud/src/app/@core'

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
    NgmI18nPipe
  ],
  selector: 'xpert-tool-builtin-parameters',
  templateUrl: './parameters.component.html',
  styleUrl: 'parameters.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertToolBuiltinParametersComponent {
  readonly toolsetService = inject(XpertToolsetService)
  readonly #formBuilder = inject(FormBuilder)
  readonly #dialog = inject(MatDialog)
  readonly #cdr = inject(ChangeDetectorRef)

  readonly tool = input<IBuiltinTool>()
}
