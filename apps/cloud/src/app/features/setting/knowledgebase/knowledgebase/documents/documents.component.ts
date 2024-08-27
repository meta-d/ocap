import { AsyncPipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MatDialog } from '@angular/material/dialog'
import { RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { injectParams } from 'ngxtension/inject-params'
import { switchMap } from 'rxjs'
import { KnowledgeDocumentService, Store, ToastrService, routeAnimations } from '../../../../../@core'
import { FilesUploadDialogComponent, MaterialModule, TranslationBaseComponent } from '../../../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-knowledgebase-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  imports: [AsyncPipe, RouterModule, TranslateModule, MaterialModule, NgmCommonModule],
  animations: [routeAnimations]
})
export class KnowledgeDocumentsComponent extends TranslationBaseComponent {
  readonly knowledgeDocumentService = inject(KnowledgeDocumentService)
  readonly _toastrService = inject(ToastrService)
  readonly #store = inject(Store)
  readonly #dialog = inject(MatDialog)
  readonly paramId = injectParams('id')

  readonly items = toSignal(
    this.knowledgeDocumentService.selectOrganizationId().pipe(switchMap(() => this.knowledgeDocumentService.getAll()))
  )

  uploadDocuments() {
    this.#dialog
      .open(FilesUploadDialogComponent, {
        data: {}
      })
      .afterClosed()
      .subscribe({
        next: (files) => {},
        error: (err) => {}
      })
  }
}
