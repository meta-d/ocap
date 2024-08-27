import { AsyncPipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { derivedFrom } from 'ngxtension/derived-from'
import { injectParams } from 'ngxtension/inject-params'
import { of, pipe, switchMap } from 'rxjs'
import { KnowledgebaseService, Store, ToastrService, routeAnimations } from '../../../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-knowledgebase-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
  imports: [AsyncPipe, RouterModule, TranslateModule, MaterialModule],
  animations: [routeAnimations]
})
export class KnowledgeConfigurationComponent extends TranslationBaseComponent {
  readonly knowledgebaseService = inject(KnowledgebaseService)
  readonly _toastrService = inject(ToastrService)
  readonly #store = inject(Store)
  readonly paramId = injectParams('id')

}
