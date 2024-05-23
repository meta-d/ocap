import { Component, TemplateRef, inject, model, signal, viewChild } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule, TableColumn } from '@metad/ocap-angular/common'
import { DisplayBehaviour } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { BehaviorSubject, map, pipe, switchMap } from 'rxjs'
import { AiBusinessRole, CopilotExampleService, CopilotRoleService, ToastrService } from '../../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../../@shared'
import { derivedFrom } from 'ngxtension/derived-from'

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
  readonly roleService = inject(CopilotRoleService)
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

  readonly roleFilter = model<AiBusinessRole | string>(null)
  readonly commandFilter = model<string>(null)
  readonly refresh$ = new BehaviorSubject<void>(null)
  readonly items = derivedFrom([this.refresh$, this.roleFilter, this.commandFilter], pipe(
    switchMap(([, role, command]) => this.exampleService.getAll({
      filter: {
        role,
        command
      }
    }))
  ), {initialValue: []})

  readonly roles = toSignal(this.roleService.getAll().pipe(
    map((roles) => [
      {
        key: null,
        caption: 'Default'
      },
      ...roles.map((role) => ({
        value: role,
        key: role.name,
        caption: role.title
      }))
    ])
  ))

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
