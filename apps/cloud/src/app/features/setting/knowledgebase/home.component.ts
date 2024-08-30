import { AsyncPipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmConfirmDeleteComponent, NgmConfirmUniqueComponent } from '@metad/ocap-angular/common'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { BehaviorSubject, combineLatestWith, EMPTY, map, switchMap } from 'rxjs'
import {
  getErrorMessage,
  IKnowledgebase,
  KnowledgebaseService,
  OrderTypeEnum,
  routeAnimations,
  Store,
  ToastrService
} from '../../../@core'
import { AvatarComponent, MaterialModule, TranslationBaseComponent, UserProfileInlineComponent } from '../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-knowledgebases',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    AsyncPipe,
    RouterModule,
    TranslateModule,
    MaterialModule,
    AppearanceDirective,
    DensityDirective,
    AvatarComponent,
    UserProfileInlineComponent
  ],
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
      switchMap(() =>
        this.knowledgebaseService.getAll({ relations: ['createdBy'], order: { createdAt: OrderTypeEnum.DESC } })
      ),
      map(({ items }) => items)
    )
  )

  refresh() {
    this.refresh$.next(true)
  }

  openKnowledgebase(id: string) {
    this.#router.navigate([id], { relativeTo: this.#route })
  }

  newKnowledgebase() {
    this.#dialog
      .open(NgmConfirmUniqueComponent, {
        data: {
          title: this.translateService.instant('PAC.Knowledgebase.NewKnowledgebase', {
            Default: `New Knowledgebase`
          })
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
          this.refresh()
          this._toastrService.success('Created knowledgebase', 'Success')
        },
        error: (error) => {
          this._toastrService.error(error, 'Error')
        }
      })
  }

  edit(item: IKnowledgebase) {
    this.#router.navigate([item.id, 'configuration'], { relativeTo: this.#route })
  }

  remove(item: IKnowledgebase) {
    this.#dialog
      .open(NgmConfirmDeleteComponent, {
        data: {
          value: item.name,
          information: this.translateService.instant('PAC.Knowledgebase.ConfirmDeleteKnowledgebase', {
            Default: `Confirm delete knowledgebase and all its contents?`
          })
        }
      })
      .afterClosed()
      .pipe(switchMap((confirm) => (confirm ? this.knowledgebaseService.delete(item.id) : EMPTY)))
      .subscribe({
        next: () => {
          this.refresh()
          this._toastrService.success('PAC.Messages.DeletedSuccessfully', 'Deleted Successfully')
        },
        error: (error) => {
          this._toastrService.error(getErrorMessage(error), 'Error')
        }
      })
  }
}
