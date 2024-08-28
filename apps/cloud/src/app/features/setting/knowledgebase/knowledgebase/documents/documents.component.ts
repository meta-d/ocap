import { animate, state, style, transition, trigger } from '@angular/animations'
import { AsyncPipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule, NgmConfirmDeleteComponent } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { get } from 'lodash-es'
import { BehaviorSubject, combineLatestWith, EMPTY, map, switchMap } from 'rxjs'
import { IKnowledgeDocument, IStorageFile, KnowledgeDocumentService, Store, ToastrService } from '../../../../../@core'
import { FilesUploadDialogComponent, MaterialModule, TranslationBaseComponent } from '../../../../../@shared'
import { KnowledgebaseComponent } from '../knowledgebase.component'

@Component({
  standalone: true,
  selector: 'pac-settings-knowledgebase-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  imports: [AsyncPipe, RouterModule, FormsModule, TranslateModule, MaterialModule, NgmCommonModule],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class KnowledgeDocumentsComponent extends TranslationBaseComponent {
  readonly knowledgeDocumentService = inject(KnowledgeDocumentService)
  readonly _toastrService = inject(ToastrService)
  readonly #store = inject(Store)
  readonly #dialog = inject(MatDialog)
  readonly #router = inject(Router)
  readonly #route = inject(ActivatedRoute)
  readonly knowledgebaseComponent = inject(KnowledgebaseComponent)

  readonly knowledgebase = this.knowledgebaseComponent.knowledgebase

  readonly refresh$ = new BehaviorSubject<boolean>(true)
  readonly items = toSignal(
    this.knowledgeDocumentService.selectOrganizationId().pipe(
      combineLatestWith(this.refresh$),
      switchMap(() => this.knowledgeDocumentService.getAll({ relations: ['storageFile'] })),
      map((items) => items.map((item) => ({...item, parserConfig: item.parserConfig ?? {} })))
    )
  )

  columnsToDisplay = [
    {
      name: 'name',
      caption: 'Name'
    },
    {
      name: 'type',
      caption: 'Type'
    },
    {
      name: 'status',
      caption: 'Status'
    },
    {
      name: 'processMsg',
      caption: 'Message'
    }
  ]
  columnsToDisplayWithExpand = [...this.columnsToDisplay.map(({ name }) => name), 'expand']
  expandedElement: any | null

  getValue(row: any, name: string) {
    return get(row, name)
  }

  refresh() {
    this.refresh$.next(true)
  }

  uploadDocuments() {
    this.#dialog
      .open(FilesUploadDialogComponent, {
        panelClass: 'medium',
        data: {}
      })
      .afterClosed()
      .pipe(
        switchMap((files: IStorageFile[]) =>
          files
            ? this.knowledgeDocumentService.createBulk(
                files.map((file) => ({
                  knowledgebaseId: this.knowledgebase().id,
                  storageFileId: file.id
                }))
              )
            : EMPTY
        )
      )
      .subscribe({
        next: (files: IKnowledgeDocument[]) => {
          console.log(files)
          this.refresh()
        },
        error: (err) => {}
      })
  }

  deleteDocument(id: string, storageFile: IStorageFile) {
    this.#dialog
      .open(NgmConfirmDeleteComponent, {
        data: {
          value: id,
          information: `${storageFile.originalName}`
        }
      })
      .afterClosed()
      .pipe(switchMap((confirm) => (confirm ? this.knowledgeDocumentService.delete(id) : EMPTY)))
      .subscribe({
        next: () => {
          this.refresh()
        },
        error: (err) => {}
      })
  }

  updateParserConfig(document: IKnowledgeDocument, config: Partial<IKnowledgeDocument['parserConfig']>) {
    this.knowledgeDocumentService
      .update(document.id, {
        parserConfig: { ...(document.parserConfig ?? {}), ...config } as IKnowledgeDocument['parserConfig']
      })
      .subscribe({
        next: () => {},
        error: (err) => {}
      })
  }

  startParsing(id: string) {
    this.knowledgeDocumentService.startParsing(id).subscribe({
      next: () => {
        this.refresh()
      },
      error: (err) => {}
    })
  }
}
