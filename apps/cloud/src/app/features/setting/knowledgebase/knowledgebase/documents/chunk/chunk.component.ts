import { animate, state, style, transition, trigger } from '@angular/animations'
import { AsyncPipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { get } from 'lodash-es'
import { BehaviorSubject, combineLatestWith, map, switchMap } from 'rxjs'
import { KnowledgeDocumentService, Store, ToastrService } from '../../../../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../../../../@shared'
import { KnowledgebaseComponent } from '../../knowledgebase.component'

@Component({
  standalone: true,
  selector: 'pac-settings-knowledgebase-document-chunk',
  templateUrl: './chunk.component.html',
  styleUrls: ['./chunk.component.scss'],
  imports: [AsyncPipe, RouterModule, FormsModule, TranslateModule, MaterialModule, NgmCommonModule],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class KnowledgeDocumentChunkComponent extends TranslationBaseComponent {
  readonly knowledgeDocumentService = inject(KnowledgeDocumentService)
  readonly _toastrService = inject(ToastrService)
  readonly #store = inject(Store)
  readonly #dialog = inject(MatDialog)
  readonly knowledgebaseComponent = inject(KnowledgebaseComponent)

  readonly knowledgebase = this.knowledgebaseComponent.knowledgebase

  readonly refresh$ = new BehaviorSubject<boolean>(true)
  readonly items = toSignal(
    this.knowledgeDocumentService.selectOrganizationId().pipe(
      combineLatestWith(this.refresh$),
      switchMap(() => this.knowledgeDocumentService.getAll({ relations: ['storageFile'] })),
      map((items) => items.map((item) => ({ ...item, parserConfig: item.parserConfig ?? {} })))
    )
  )

  getValue(row: any, name: string) {
    return get(row, name)
  }

  refresh() {
    this.refresh$.next(true)
  }
}
