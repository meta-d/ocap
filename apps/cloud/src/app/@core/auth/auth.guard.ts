import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router'
import { Store } from '@metad/cloud/state'
import { firstValueFrom } from 'rxjs'
import { AuthStrategy } from './auth-strategy.service'

@Injectable()
export class AuthGuard  {
  constructor(
    private readonly router: Router,
    private readonly store: Store,
    private readonly authStrategy: AuthStrategy
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const token = route.queryParamMap.get('token')
    const userId = route.queryParamMap.get('userId')
    if (token && userId) {
      // this.store.token = token;
      // this.store.userId = userId;
    }

    const isAuthenticated = !!this.store.token
    if (isAuthenticated) {
      // logged in so return true
      return true
    }

    // // not logged in so redirect to login page with the return url
    // if (this.electronService.isElectronApp) {
    // 	try {
    // 		this.electronService.ipcRenderer.send('logout');
    // 	} catch (error) {}
    // }

    // logout and clear local store before redirect to login page
    await firstValueFrom(this.authStrategy.logout())

    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    })
    return false
  }
}
