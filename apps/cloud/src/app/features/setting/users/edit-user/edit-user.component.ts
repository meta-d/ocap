import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { UsersService } from '@metad/cloud/state'
import { MaterialModule, SharedModule } from 'apps/cloud/src/app/@shared'
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators'
import { routeAnimations } from '../../../../@core'
import { UserBasicComponent } from '../user-basic/user-basic.component'
import { PACUserOrganizationsComponent } from '../organizations/organizations.component'
import { toSignal } from '@angular/core/rxjs-interop'
import { PACUsersComponent } from '../users.component'

@Component({
  standalone: true,
  selector: 'pac-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss'],
  animations: [routeAnimations],
  imports: [SharedModule, MaterialModule, UserBasicComponent, PACUserOrganizationsComponent]
})
export class PACEditUserComponent implements OnDestroy {

  private userService = inject(UsersService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private usersComponent = inject(PACUsersComponent)

  public readonly userId$ = this.route.params.pipe(
    startWith(this.route.snapshot.params),
    map((params) => params?.id),
    filter((id) => !!id),
    distinctUntilChanged()
  )

  public readonly user = toSignal(this.userId$.pipe(
    switchMap((userId) => this.userService.getUserById(userId))))

  constructor() {
    effect(() => {
      this.usersComponent.setCurrentLink(this.user())
    }, {allowSignalWrites: true})
  }

  navigate(url) {
    this.router.navigate([url], { relativeTo: this.route })
  }

  ngOnDestroy(): void {
    this.usersComponent.setCurrentLink(null)
  }
}
