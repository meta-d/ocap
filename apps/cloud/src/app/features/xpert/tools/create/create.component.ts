import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { routeAnimations } from '@metad/core'
import { ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { XpertStudioConfigureToolComponent } from '../configure/configure.component'
import { MaterialModule } from 'apps/cloud/src/app/@shared'
import { getErrorMessage, IXpertToolset, ToastrService, XpertToolsetService } from 'apps/cloud/src/app/@core'
import { MatDialogRef } from '@angular/material/dialog'


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
export class XpertStudioCreateToolComponent {
  private readonly xpertToolsetService = inject(XpertToolsetService)
  readonly #toastr = inject(ToastrService)
  readonly #dialogRef = inject(MatDialogRef)

  readonly loading = signal(false)

  createTool(toolset: Partial<IXpertToolset>) {
    this.xpertToolsetService.create({
      ...toolset,
      
    }).subscribe({
      next: (result) => {
        this.#toastr.success('PAC.Messages.CreatedSuccessfully', {Default: 'Created Successfully!'}, result.name)
        this.#dialogRef.close(result)
      },
      error: (error) => {
        this.#toastr.error(getErrorMessage(error))
      }
    })
  }
}
