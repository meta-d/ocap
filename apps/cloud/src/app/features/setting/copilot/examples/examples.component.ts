import { Component, TemplateRef, inject, signal, viewChild } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule, TableColumn } from '@metad/ocap-angular/common'
import { DisplayBehaviour } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { BehaviorSubject, switchMap } from 'rxjs'
import { AiBusinessRole, CopilotExampleService, ToastrService } from '../../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-copilot-examples',
  templateUrl: './examples.component.html',
  styleUrls: ['./examples.component.scss'],
  imports: [RouterModule, TranslateModule, MaterialModule, FormsModule, ReactiveFormsModule, NgmCommonModule]
})
export class CopilotExamplesComponent extends TranslationBaseComponent {

  DisplayBehaviour = DisplayBehaviour

  readonly exampleService = inject(CopilotExampleService)
  readonly _toastrService = inject(ToastrService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)

  readonly actionTemplate = viewChild('actionTemplate', { read: TemplateRef })

  readonly columns = signal<TableColumn[]>([
    {
      name: 'role',
      caption: 'Business Role',
    },
    {
      name: 'command',
      caption: 'Copilot Command',
    },
    {
      name: 'input',
      caption: 'Input',
    },
    {
      name: 'output',
      caption: 'Output',
    },
    {
      name: 'metadata',
      caption: 'Metadata',
    },
    {
      name: 'actions',
      caption: 'Actions',
      cellTemplate: this.actionTemplate,
      stickyEnd: true
    },
  ])

  readonly refresh$ = new BehaviorSubject<void>(null)
  readonly items = toSignal(this.refresh$.pipe(
    switchMap(() => this.exampleService.getAll())
  ))

  readonly roles = signal([
    {
      key: null,
      caption: 'Default'
    },
    {
      key: AiBusinessRole.FinanceBP,
      caption: 'Finance Business Partner'
    },
    {
      key: AiBusinessRole.SupplyChainExpert,
      caption: 'Supply Chain Expert'
    }
  ])

  readonly commands = signal([
    {
      key: 'calculation',
      caption: 'Create or Edit Calculation Measure'
    },
  ])

  refresh() {
    this.refresh$.next()
  }

  addExample() {
    this.router.navigate(['create'], { relativeTo: this.route })
  }

  editExample(id: string) {
    this.router.navigate([id], { relativeTo: this.route })
  }

  deleteExample(id: string) {
    this.exampleService.delete(id).subscribe({
      next: () => {
        this._toastrService.success('Deleted successfully')
      },
      error: (error) => {
        this._toastrService.error('Failed to delete')
      }
    })
  }
}
