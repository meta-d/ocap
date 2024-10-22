import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { routeAnimations } from '@metad/core'
import { ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { XpertStudioConfigureToolComponent } from '../configure/configure.component'
import { MaterialModule } from 'apps/cloud/src/app/@shared'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    ButtonGroupDirective,
    DensityDirective,
    XpertStudioConfigureToolComponent
  ],
  selector: 'pac-xpert-tool-create',
  templateUrl: './create.component.html',
  styleUrl: 'create.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertStudioCreateToolComponent {}
