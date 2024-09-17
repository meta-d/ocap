import { CommonModule } from '@angular/common'
import { Component, model } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { IKnowledgebase } from '../../../@core/types'
import { AvatarComponent } from '../../files'
import { MaterialModule } from '../../material.module'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
    ButtonGroupDirective,
    DensityDirective,
    AvatarComponent
  ],
  selector: 'pac-knowledgebase-card',
  templateUrl: 'knowledgebase.component.html',
  styleUrls: ['knowledgebase.component.scss']
})
export class KnowledgebaseCardComponent {
  readonly knowledgebase = model<IKnowledgebase>()
}
