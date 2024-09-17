import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'
import { ICopilotRole } from '@metad/contracts'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { AvatarComponent } from '../../files/avatar/avatar.component'
import { MaterialModule } from '../../material.module'
import { KnowledgebaseCardComponent } from '../knowledgebase-card/knowledgebase.component'
import { ToolsetCardComponent } from '../toolset-card/toolset.component'


@Component({
  standalone: true,
  selector: 'pac-about-role',
  templateUrl: './about-role.component.html',
  styleUrls: ['about-role.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
    ButtonGroupDirective,
    AppearanceDirective,
    DensityDirective,
    AvatarComponent,
    KnowledgebaseCardComponent,
    ToolsetCardComponent
  ]
})
export class AboutRoleComponent {
  private readonly _dialog = inject(MatDialog)
  readonly #dialogRef = inject(MatDialogRef)
  private readonly _data = inject<{ role: ICopilotRole }>(MAT_DIALOG_DATA)

  get role() {
    return this._data.role
  }
  
  onStart(statement: string): void {
    this.#dialogRef.close(statement)
  }
}
