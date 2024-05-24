import { Component, TemplateRef, effect, inject, model, signal, viewChild } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { ConfirmDeleteComponent, NgmCommonModule, NgmConfirmOptionsComponent, TableColumn } from '@metad/ocap-angular/common'
import { DisplayBehaviour } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { BehaviorSubject, EMPTY, combineLatestWith, map, pipe, switchMap } from 'rxjs'
import { AiBusinessRole, CopilotExampleService, CopilotRoleService, ICopilotExample, ToastrService, getErrorMessage } from '../../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../../@shared'
import { derivedFrom } from 'ngxtension/derived-from'
import { uploadYamlFile } from '@metad/core'
import { MatDialog } from '@angular/material/dialog'
import { FORMLY_W_1_2 } from '@metad/formly'


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
  readonly dialog = inject(MatDialog)

  readonly actionTemplate = viewChild('actionTemplate', { read: TemplateRef })
  readonly vector = viewChild('vector', { read: TemplateRef })

  readonly columns = toSignal<TableColumn[]>(this.translateService.stream('PAC.Copilot.Examples').pipe(
    map((i18n) => [
      {
        name: 'vector',
        caption: i18n?.Vectorized || 'Vectorized',
        cellTemplate: this.vector,
      },
      {
        name: 'role',
        caption: i18n?.BusinessRole || 'Business Role',
      },
      {
        name: 'command',
        caption: i18n?.CopilotCommand || 'Copilot Command',
      },
      {
        name: 'input',
        caption: i18n?.Input || 'Input',
        width: '400px'
      },
      {
        name: 'output',
        caption: i18n?.Output || 'Output',
        width: '400px'
      },
      {
        name: 'metadata',
        caption: i18n?.Metadata || 'Metadata',
        pipe: (value) => JSON.stringify(value),
        width: '400px'
      },
      {
        name: 'actions',
        caption: i18n?.Actions || 'Actions',
        cellTemplate: this.actionTemplate,
        stickyEnd: true
      },
    ])
  ))

  readonly roleFilter = model<AiBusinessRole | string>(null)
  readonly commandFilter = model<string>(null)
  readonly refresh$ = new BehaviorSubject<void>(null)
  readonly items = derivedFrom([this.roleFilter, this.commandFilter], pipe(
    combineLatestWith(this.refresh$),
    switchMap(([[role, command]]) => this.exampleService.getAll({
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

  readonly commands = derivedFrom([this.roleFilter], pipe(
    switchMap(([role]) => this.exampleService.getCommands({role})),
    map((commands) => commands.map((command) => ({
      key: command,
      caption: command
    }))
  )), {initialValue: []})

  readonly loading = signal(false)

  constructor() {
    super()

    effect(() => {
      if (this.items()) {
        this.loading.set(false)
      }
    }, { allowSignalWrites: true })
  }

  refresh() {
    this.refresh$.next()
  }

  addExample() {
    this.router.navigate(['create'], { relativeTo: this.route })
  }

  editExample(id: string) {
    this.router.navigate([id], { relativeTo: this.route })
  }

  deleteExample(id: string, input: string) {
    this.dialog.open(ConfirmDeleteComponent, {
      data: {
        value: id,
        information: `Input: ${input}`
      }
    })
    .afterClosed()
    .pipe(
      switchMap((confirm) => {
        if (confirm) {
          this.loading.set(true)
          return this.exampleService.delete(id)
        } else {
          return EMPTY
        }
      })
    )
    .subscribe({
      next: () => {
        this._toastrService.success('PAC.Messages.DeletedSuccessfully', {Default: 'Deleted successfully'})
        return this.refresh()
      },
      error: (error) => {
        this._toastrService.error(getErrorMessage(error))
        this.loading.set(false)
      }
    })
  }

  async handleUploadChange(event) {
    const examples = await uploadYamlFile<ICopilotExample[]>(event.target.files[0])

    if (!examples.length) {
      this._toastrService.error('', 'PAC.Messages.NoRecordsFoundinFile', {Default: 'No records found in the file'})
      return
    }

    this.dialog.open(NgmConfirmOptionsComponent, {
      data: {
        information: this.translateService.instant('PAC.Copilot.Examples.ConfirmOptionsForUploadExample', {Default: 'Please confirm the options for upload copilot examples'}),
        formFields: [
          {
            className: FORMLY_W_1_2,
            key: 'clearRole',
            type: 'checkbox',
            props: {
              label: this.translateService.instant('PAC.Copilot.Examples.ClearRole', {Default: 'Clear all existed examples for roles'}),
            }
          }
        ]
      }
    }).afterClosed().pipe(
      switchMap((options) => {
        if (options) {
          this.loading.set(true)
          return this.exampleService.createBulk(examples, options).pipe()
        } else {
          return EMPTY
        }
      })
    ).subscribe({
      next: () => {
        this._toastrService.success('PAC.Messages.UploadSuccessfully', {Default: 'Upload successfully'})
        this.refresh()
      },
      error: (error) => {
        this._toastrService.error(getErrorMessage(error))
        this.loading.set(false)
      }
    })
  }
}
