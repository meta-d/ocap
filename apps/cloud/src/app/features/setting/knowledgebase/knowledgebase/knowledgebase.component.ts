import { AsyncPipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { derivedFrom } from 'ngxtension/derived-from'
import { injectParams } from 'ngxtension/inject-params'
import { BehaviorSubject, of, pipe, switchMap } from 'rxjs'
import { KnowledgebaseService, ToastrService, routeAnimations } from '../../../../@core'
import { AvatarComponent, MaterialModule, TranslationBaseComponent } from '../../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-knowledgebase',
  templateUrl: './knowledgebase.component.html',
  styleUrls: ['./knowledgebase.component.scss'],
  imports: [AsyncPipe, RouterModule, TranslateModule, MaterialModule, AvatarComponent],
  animations: [routeAnimations]
})
export class KnowledgebaseComponent extends TranslationBaseComponent {
  readonly knowledgebaseService = inject(KnowledgebaseService)
  readonly _toastrService = inject(ToastrService)
  readonly paramId = injectParams('id')

  readonly refresh$ = new BehaviorSubject<boolean>(true)
  readonly knowledgebase = derivedFrom(
    [this.paramId],
    pipe(
      switchMap(([id]) =>
        id ? this.refresh$.pipe(switchMap(() => this.knowledgebaseService.getOneById(id))) : of(null)
      )
    ),
    {
      initialValue: null
    }
  )

  refresh() {
    this.refresh$.next(true)
  }
}
