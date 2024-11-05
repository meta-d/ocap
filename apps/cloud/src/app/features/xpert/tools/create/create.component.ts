import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { routeAnimations } from '@metad/core'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { MatDialogRef } from '@angular/material/dialog'
import { CdkListboxModule } from '@angular/cdk/listbox'
import { MaterialModule } from 'apps/cloud/src/app/@shared'
import { getErrorMessage, IXpertToolset, ToastrService, XpertToolsetService } from 'apps/cloud/src/app/@core'
import { XpertStudioConfigureToolComponent } from '../openapi/'
import { XpertStudioConfigureODataComponent } from '../odata/'


@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    CdkListboxModule,
    ButtonGroupDirective,
    XpertStudioConfigureToolComponent,
    XpertStudioConfigureODataComponent
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

  readonly providerTypes = model<string[]>(['openapi'])

  readonly toolset = model<IXpertToolset>()

  onValueChange(event: any) {
    this.toolset.set(event)
  }

  createTool(toolset?: Partial<IXpertToolset>) {
    this.xpertToolsetService.create({
      ...(toolset ?? this.toolset()),
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
