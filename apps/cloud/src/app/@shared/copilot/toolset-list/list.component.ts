import { CdkListboxModule } from '@angular/cdk/listbox'
import { CommonModule } from '@angular/common'
import { booleanAttribute, Component, input, model } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { ICopilotToolset } from '../../../@core/types'
import { AvatarComponent } from '../../files'
import { MaterialModule } from '../../material.module'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CdkListboxModule,
    TranslateModule,
    ButtonGroupDirective,
    DensityDirective,
    AvatarComponent
  ],
  selector: 'pac-toolset-list',
  templateUrl: 'list.component.html',
  styleUrls: ['list.component.scss']
})
export class ToolsetListComponent {
  readonly toolsetList = input<ICopilotToolset[]>()
  readonly disabled = input<boolean, string | boolean>(false, { transform: booleanAttribute })

  readonly toolsets = model()

  compareId(a: ICopilotToolset, b: ICopilotToolset): boolean {
    return a?.id === b?.id
  }
}
