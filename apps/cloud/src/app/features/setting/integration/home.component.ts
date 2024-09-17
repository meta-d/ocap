import { AsyncPipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { AppearanceDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { BehaviorSubject, map } from 'rxjs'
import { IntegrationService, routeAnimations, Store, ToastrService } from '../../../@core'
import { AvatarComponent, MaterialModule, UserProfileInlineComponent } from '../../../@shared'

@Component({
  standalone: true,
  selector: 'pac-settings-integrations',
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
export class IntegrationHomeComponent {
  readonly integrationService = inject(IntegrationService)
  readonly #toastr = inject(ToastrService)
  readonly #store = inject(Store)
  readonly #router = inject(Router)
  readonly #route = inject(ActivatedRoute)
  readonly #dialog = inject(MatDialog)

  readonly organizationId$ = this.#store.selectOrganizationId()

  readonly refresh$ = new BehaviorSubject<boolean>(true)

  readonly integrations = toSignal(this.integrationService.getAllInOrg().pipe(map(({ items }) => items)))

  newIntegration() {
    this.#router.navigate(['create'], { relativeTo: this.#route })
  }

  open(id: string) {
    this.#router.navigate([id], { relativeTo: this.#route })
  }
}
