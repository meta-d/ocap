import { AsyncPipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { derivedFrom } from 'ngxtension/derived-from'
import { injectParams } from 'ngxtension/inject-params'
import { of, pipe, switchMap } from 'rxjs'
import { KnowledgebaseService, Store, ToastrService, routeAnimations } from '../../../../@core'
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
  readonly #store = inject(Store)
  readonly paramId = injectParams('id')

  readonly knowledgebase = derivedFrom(
    [this.paramId],
    pipe(switchMap(([id]) => (id ? this.knowledgebaseService.getOneById(id) : of(null)))),
    {
      initialValue: null
    }
  )

  readonly organizationId$ = this.#store.selectOrganizationId()
}
