import { Component, TemplateRef, inject, signal, viewChild } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule, TableColumn } from '@metad/ocap-angular/common'
import { DisplayBehaviour } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { BehaviorSubject, EMPTY, catchError, switchMap, tap } from 'rxjs'
import { CopilotRoleService, ICopilotRole, ToastrService, getErrorMessage, omitSystemProperty } from '../../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../../@shared'
import { ConfirmDeleteComponent } from '@metad/components/confirm'
import { MatDialog } from '@angular/material/dialog'

export type CopilotRoleRowType = Partial<ICopilotRole> & { __edit__?: boolean }

@Component({
  standalone: true,
  selector: 'pac-settings-copilot-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  imports: [RouterModule, TranslateModule, MaterialModule, FormsModule, ReactiveFormsModule, NgmCommonModule]
})
export class CopilotRolesComponent extends TranslationBaseComponent {

  DisplayBehaviour = DisplayBehaviour

  readonly roleService = inject(CopilotRoleService)
  readonly _toastrService = inject(ToastrService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly dialog = inject(MatDialog)
  

  readonly actionTemplate = viewChild('actionTemplate', { read: TemplateRef })

  readonly columns = signal<TableColumn[]>([
    {
      name: 'name',
      caption: 'Name',
    },
    {
      name: 'title',
      caption: 'Title',
    },
    {
      name: 'titleCN',
      caption: 'Title (CN)',
    },
    {
      name: 'description',
      caption: 'Description',
    },
    {
      name: 'actions',
      caption: 'Actions',
      cellTemplate: this.actionTemplate,
      stickyEnd: true
    },
  ])

  readonly refresh$ = new BehaviorSubject<void>(null)

  readonly dataSource = signal<CopilotRoleRowType[]>([])

  displayedColumns = ['name', 'title', 'titleCN', 'description', 'actions']

  private itemsSub = this.refresh$.pipe(
    switchMap(() => this.roleService.getAll())
  ).subscribe((items) => {
    this.dataSource.set(items)
  })

  addRole() {
    this.dataSource.update((items) => [...items, {__edit__: true}])
  }

  startEdit(item: CopilotRoleRowType) {
    item.__edit__ = true
  }

  saveEdit(item: CopilotRoleRowType) {
    if (item.id) {
      this.roleService.update(item.id, omitSystemProperty(item)).subscribe({
        next: () => {
            this._toastrService.success('Role updated successfully')
            this.refresh$.next()
          },
        error: (err) => {
            this._toastrService.error(getErrorMessage(err))
        }
      })
    } else {
        this.roleService.create(omitSystemProperty(item)).subscribe({
        next: () => {
            this._toastrService.success('Role created successfully')
            this.refresh$.next()
          },
        error: (err) => {
            this._toastrService.error(getErrorMessage(err))
        }
      })
    }
  }

  deleteRole(item: CopilotRoleRowType) {
    if (item.id) {
      this.dialog.open(ConfirmDeleteComponent, {
        data: {
            value: item.title,
            information: 'Are you sure you want to delete this role?'
        }
      })
      .afterClosed()
      .pipe(
          switchMap((result) => {
              if (result) {
                  return this.roleService.delete(item.id).pipe(
                      tap(() => {
                          this._toastrService.success('Role deleted successfully')
                          this.refresh$.next()
                      }),
                      catchError((err) => {
                          this._toastrService.error(getErrorMessage(err))
                          return EMPTY
                      })
                  )
              }
              return EMPTY
          })
      ).subscribe()
    } else {
      this.dataSource.update((items) => items.filter((x) => x !== item))
    }
  }
}
