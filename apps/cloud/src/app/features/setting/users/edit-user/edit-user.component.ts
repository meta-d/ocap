import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { UsersService } from '@metad/cloud/state'
import { distinctUntilChanged, filter, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators'
import { routeAnimations } from '../../../../@core'

@Component({
  selector: 'pac-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss'],
  animations: [routeAnimations]
})
export class PACEditUserComponent implements OnInit {

  public readonly userId$ = this.route.params.pipe(
    startWith(this.route.snapshot.params),
    map((params) => params?.id),
    filter((id) => !!id),
    distinctUntilChanged()
  )

  public readonly user$ = this.userId$.pipe(
    switchMap((userId) => this.userService.getUserById(userId)),
    shareReplay(1)
  )

  constructor(private userService: UsersService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    //
  }

  navigate(url) {
    this.router.navigate([url], { relativeTo: this.route })
  }
}
