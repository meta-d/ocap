import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Store } from '../../../@core'

/**
 * @deprecated use HeaderSettingsComponent
 */
@Component({
  selector: 'pac-authentication',
  template: `<button
      *ngIf="isAuthenticated$ | async as user"
      mat-icon-button
      [matMenuTriggerFor]="userMenu"
    >
      <img *ngIf="user?.imageUrl" class="avatar w-4/6 h-4/6 m-auto rounded-full" [src]="user.imageUrl" />
      <mat-icon *ngIf="!user?.imageUrl">account_circle</mat-icon>
    </button>

    <mat-menu #userMenu="matMenu" class="ngm-density__compact">
      <button mat-menu-item (click)="onProfile()">
        <mat-icon>account_circle</mat-icon>
        <span>{{ 'PAC.menu.profile' | translate }}</span>
      </button>

      <button mat-menu-item (click)="onLogoutClick()">
        <mat-icon>settings_power</mat-icon>
        <span>{{ 'PAC.menu.logout' | translate }}</span>
      </button>
    </mat-menu> `,
  styles: [
    `
:host {
    display: flex;
}
    `
  ]
})
export class AuthenticationComponent implements OnInit {
  public readonly isAuthenticated$ = this.store.user$

  constructor(private readonly store: Store, private router: Router) {}

  ngOnInit() {}

  onProfile() {
    this.router.navigate(['/settings/account'])
  }

  onLogoutClick(): void {
    this.router.navigate(['/auth/logout'])
  }
}
