import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatTabsModule } from '@angular/material/tabs'
import { RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateModule } from '@ngx-translate/core'
import { AppService } from '../../app.service'
import { routeAnimations } from '../../@core'

@UntilDestroy({ checkProperties: true })
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    RouterModule,
    MatTabsModule,

    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatInputModule,
    MatSidenavModule,
    MatListModule,
    TranslateModule,
    DensityDirective,
    ButtonGroupDirective,
    NgmCommonModule,
    AppearanceDirective
  ],
  selector: 'pac-home',
  template: `
<nav mat-tab-nav-bar [tabPanel]="tabPanel" mat-stretch-tabs="false" mat-align-tabs="start" color="accent" disableRipple displayDensity="cosy" class="pac-home__navigation p-0 sm:px-2 md:px-8">
  <span
    mat-tab-link
    routerLink="."
    routerLinkActive
    #rla="routerLinkActive"
    [routerLinkActiveOptions]="{ exact: true }"
    [active]="rla.isActive"
  >
    {{ 'PAC.MENU.HOME.TODAY' | translate: { Default: 'Today' } }}
  </span>
  <span
    mat-tab-link
    routerLink="./catalog"
    routerLinkActive
    #rla2="routerLinkActive"
    [routerLinkActiveOptions]="{ exact: true }"
    [active]="rla2.isActive"
  >
    {{ 'PAC.MENU.HOME.Catalog' | translate: { Default: 'Catalog' } }}
  </span>
  <span
    mat-tab-link
    routerLink="./trending"
    routerLinkActive
    #rla3="routerLinkActive"
    [routerLinkActiveOptions]="{ exact: true }"
    [active]="rla3.isActive"
  >
    {{ 'PAC.MENU.HOME.Trending' | translate: { Default: 'Trending' } }}
  </span>
  <span *ngIf="copilotEnabled$ | async"
    mat-tab-link
    routerLink="./insight"
    routerLinkActive
    #rla4="routerLinkActive"
    [routerLinkActiveOptions]="{ exact: true }"
    [active]="rla4.isActive"
  >
    {{ 'PAC.MENU.HOME.Insight' | translate: { Default: 'Insight' } }}
  </span>
</nav>
<mat-tab-nav-panel #tabPanel class="flex-1 overflow-auto" [@routeAnimations]="o.isActivated && o.activatedRoute.routeConfig.path">
  <router-outlet #o="outlet"></router-outlet>
</mat-tab-nav-panel>
  `,
  styles: [
    `
      :host {
        flex: 1;
        max-width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
    `
  ],
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private readonly appService = inject(AppService)

  public readonly copilotEnabled$ = this.appService.copilotEnabled$
}
