import { AsyncPipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmConfirmUniqueComponent } from '@metad/ocap-angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { BehaviorSubject, combineLatestWith, EMPTY, map, switchMap } from 'rxjs'
import { KnowledgebaseService, routeAnimations, Store, ToastrService } from '../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-knowledgebases',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [AsyncPipe, RouterModule, TranslateModule, MaterialModule],
  animations: [routeAnimations]
})
export class KnowledgebaseHomeComponent extends TranslationBaseComponent {
  readonly knowledgebaseService = inject(KnowledgebaseService)
  readonly _toastrService = inject(ToastrService)
  readonly #store = inject(Store)
  readonly #router = inject(Router)
  readonly #route = inject(ActivatedRoute)
  readonly #dialog = inject(MatDialog)

  readonly organizationId$ = this.#store.selectOrganizationId()

  readonly refresh$ = new BehaviorSubject<boolean>(true)
  readonly knowledgebases = toSignal(
    this.knowledgebaseService.selectOrganizationId().pipe(
      combineLatestWith(this.refresh$),
      switchMap(() => this.knowledgebaseService.getAll()),
      map(({items}) => items)
    )
  )

  openKnowledgebase(id: string) {
    this.#router.navigate([id], { relativeTo: this.#route })
  }

  newKnowledgebase() {
    this.#dialog
      .open(NgmConfirmUniqueComponent, {
        data: {
          title: this.getTranslation('knowledgebases.new'),
        }
      })
      .afterClosed()
      .pipe(
        switchMap((value) =>
          value
            ? this.knowledgebaseService.create({
                name: value
              })
            : EMPTY
        )
      )
      .subscribe({
        next: (result) => {
          this._toastrService.success('Created knowledgebase', 'Success')
        },
        error: (error) => {
          this._toastrService.error(error, 'Error')
        }
      })
  }
}
