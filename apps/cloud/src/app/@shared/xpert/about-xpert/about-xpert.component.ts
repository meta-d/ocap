import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { AvatarComponent } from '../../files/avatar/avatar.component'
import { MaterialModule } from '../../material.module'
import { IXpertRole } from '../../../@core'
import { KnowledgebaseCardComponent } from '../../copilot'
import { ToolsetCardComponent } from '../toolset-card/toolset.component'
import { EmojiAvatarComponent } from "../../avatar/emoji-avatar/avatar.component";


@Component({
  standalone: true,
  selector: 'pac-about-xpert',
  templateUrl: './about-xpert.component.html',
  styleUrls: ['about-xpert.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
    ButtonGroupDirective,
    AppearanceDirective,
    DensityDirective,
    KnowledgebaseCardComponent,
    ToolsetCardComponent,
    EmojiAvatarComponent
]
})
export class AboutXpertComponent {
  private readonly _dialog = inject(MatDialog)
  readonly #dialogRef = inject(MatDialogRef)
  private readonly _data = inject<{ role: IXpertRole }>(MAT_DIALOG_DATA)

  get role() {
    return this._data.role
  }
  
  onStart(statement: string): void {
    this.#dialogRef.close(statement)
  }
}
