import { AsyncPipe } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { nonBlank } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { get } from 'lodash-es'
import { injectParams } from 'ngxtension/inject-params'
import { BehaviorSubject, distinctUntilChanged, filter, of, switchMap } from 'rxjs'
import {
  getErrorMessage,
  IDocumentChunk,
  KnowledgeDocumentService,
  Store,
  ToastrService
} from '../../../../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../../../../@shared'
import { KnowledgebaseComponent } from '../../knowledgebase.component'

@Component({
  standalone: true,
  selector: 'pac-settings-knowledgebase-document-chunk',
  templateUrl: './chunk.component.html',
  styleUrls: ['./chunk.component.scss'],
  imports: [AsyncPipe, RouterModule, FormsModule, TranslateModule, MaterialModule, NgmCommonModule]
})
export class KnowledgeDocumentChunkComponent extends TranslationBaseComponent {
  readonly knowledgeDocumentService = inject(KnowledgeDocumentService)
  readonly _toastrService = inject(ToastrService)
  readonly #store = inject(Store)
  readonly #router = inject(Router)
  readonly #route = inject(ActivatedRoute)
  readonly #dialog = inject(MatDialog)
  readonly knowledgebaseComponent = inject(KnowledgebaseComponent)
  readonly paramId = injectParams('id')

  readonly knowledgebase = this.knowledgebaseComponent.knowledgebase

  readonly refresh$ = new BehaviorSubject<boolean>(true)
  readonly chunks = signal<IDocumentChunk[]>([])

  constructor() {
    super()
    toObservable(this.paramId)
      .pipe(
        distinctUntilChanged(),
        filter(nonBlank),
        switchMap((id) => (id ? this.knowledgeDocumentService.getChunks(id) : of(null))),
        takeUntilDestroyed()
      )
      .subscribe((chunks) => this.chunks.set(chunks))
  }

  getValue(row: any, name: string) {
    return get(row, name)
  }

  refresh() {
    this.refresh$.next(true)
  }

  close() {
    this.#router.navigate(['..'], { relativeTo: this.#route })
  }

  deleteChunk(chunk: IDocumentChunk) {
    this.knowledgeDocumentService.deleteChunk(chunk.metadata.knowledgeId, chunk.id).subscribe({
      next: () => {
        this.chunks.update((items) => items.filter((item) => item.id !== chunk.id))
      },
      error: (error) => {
        this._toastrService.error(getErrorMessage(error))
      }
    })
  }
}
