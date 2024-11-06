import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, model } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog'
import { NgmI18nPipe } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { IXpertTool } from 'apps/cloud/src/app/@core'
import { XpertToolAuthorizationInputComponent } from '../../authorization'
import { XpertToolsetToolTestComponent } from '../test/tool.component'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatDialogModule,
    MatButtonModule,

    NgmI18nPipe,

    XpertToolsetToolTestComponent,
    XpertToolAuthorizationInputComponent
  ],
  selector: 'xpert-tool-odata-test',
  templateUrl: './tool.component.html',
  styleUrl: 'tool.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertToolTestDialogComponent {
  readonly #dialogRef = inject(MatDialog)
  readonly #data = inject<{ tool: IXpertTool }>(MAT_DIALOG_DATA)

  readonly credentials = model(this.#data.tool.toolset.credentials)
  readonly tool = computed(() => ({
    ...this.#data.tool,
    toolset: {
      ...this.#data.tool.toolset,
      credentials: this.credentials(),
      tools: null
    }
  }))
}
