import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { AnalyticsPermissionsEnum, FeatureEnum, PermissionsEnum, RolesEnum, Store, routeAnimations } from '../../@core'

@Component({
  selector: 'pac-settings',
  template: `
    <div class="flex flex-col w-36 md:w-64 max-w-xs p-2 md:p-4 md:pr-0">
      <!-- <h2 class="text-lg">
    {{ 'PAC.MENU.Settings' | translate: {Default: 'Settings'} }}
  </h2> -->
      <ul class="pac-nav__tab-bar flex-1 py-2 bg-slate-200 rounded-lg shadow-lg dark:bg-bluegray-800">
        <li
          class="pac-nav__tab-bar flex justify-start items-center px-4 py-2 cursor-pointer text-slate-600 dark:text-bluegray-100"
          *ngFor="let e of menus$ | async"
          [routerLink]="e.link"
          [routerLinkActiveOptions]="{ exact: false }"
          routerLinkActive
          #rla="routerLinkActive"
          [class.active]="rla.isActive"
        >
          <mat-icon *ngIf="e.icon" displayDensity="cosy" fontSet="material-icons-outlined">{{ e.icon }}</mat-icon>
          <span class="ml-2">
            {{ 'PAC.MENU.' + e.label | translate: { Default: e.label } }}
          </span>
        </li>
      </ul>
    </div>

    <div
      [@routeAnimations]="o.isActivated && o.activatedRoute.routeConfig.data && o.activatedRoute.routeConfig.data.title"
      class="pac-nav__router relative flex-1"
    >
      <router-outlet #o="outlet"></router-outlet>
    </div>
  `,
  styleUrls: ['./settings.component.scss'],
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PACSettingComponent {
  private readonly rolesService = inject(NgxRolesService)
  private readonly permissionsService = inject(NgxPermissionsService)
  private readonly store = inject(Store)

  public readonly menus$ = this.permissionsService.permissions$.pipe(
    distinctUntilChanged(),
    map(() => {
      return [
        // {
        //   link: 'general',
        //   label: 'General',
        //   icon: 'settings'
        // },
        {
          link: 'account',
          label: 'Account',
          icon: 'account_circle'
        },
        {
          link: 'data-sources',
          label: 'Data Sources',
          icon: 'topic',
          data: {
            permissionKeys: [AnalyticsPermissionsEnum.DATA_SOURCE_EDIT]
          }
        },
        {
          link: 'copilot',
          label: 'Copilot',
          icon: 'assistant',
          data: {
            featureKey: FeatureEnum.FEATURE_COPILOT
          }
        },
        {
          link: 'business-area',
          label: 'Business Area',
          icon: 'workspaces',
          data: {
            permissionKeys: [AnalyticsPermissionsEnum.BUSINESS_AREA_EDIT]
          }
        },
        {
          link: 'certification',
          label: 'Certification',
          icon: 'verified_user',
          data: {
            permissionKeys: [AnalyticsPermissionsEnum.BUSINESS_AREA_EDIT]
          }
        },
        // {
        //   link: 'notification-destinations',
        //   label: 'PAC.KEY_WORDS.NOTIFICATION_DESTINATION',
        //   icon: 'notifications',
        //   data: {
        //     permissionKeys: [AnalyticsPermissionsEnum.DATA_SOURCE_EDIT]
        //   }
        // },

        {
          link: 'users',
          label: 'User',
          icon: 'people',
          data: {
            permissionKeys: [PermissionsEnum.ORG_USERS_EDIT]
          }
        },
        {
          link: 'roles',
          label: 'Role & Permission',
          icon: 'supervisor_account',
          data: {
            permissionKeys: [PermissionsEnum.CHANGE_ROLES_PERMISSIONS]
          }
        },

        {
          link: 'email-templates',
          label: 'Email Template',
          icon: 'email',
          data: {
            permissionKeys: [PermissionsEnum.VIEW_ALL_EMAIL_TEMPLATES]
          }
        },
        {
          link: 'custom-smtp',
          label: 'Custom SMTP',
          icon: 'alternate_email',
          data: {
            permissionKeys: [PermissionsEnum.CUSTOM_SMTP_VIEW]
          }
        },

        {
          link: 'features',
          label: 'Feature',
          icon: 'widgets',
          data: {
            permissionKeys: [RolesEnum.SUPER_ADMIN]
          }
        },
        {
          link: 'organizations',
          label: 'Organization',
          icon: 'corporate_fare',
          data: {
            permissionKeys: [RolesEnum.SUPER_ADMIN]
          }
        },
        {
          link: 'tenant',
          label: 'Tenant',
          icon: 'storage',
          data: {
            permissionKeys: [RolesEnum.SUPER_ADMIN]
          }
        }
      ].filter((item: any) => {
        if (item.data?.featureKey) {
          if (!this.store.hasFeatureEnabled(item.data.featureKey)) {
            return false
          }
        }
        if (item.data?.permissionKeys) {
          const anyPermission = item.data.permissionKeys
            ? item.data.permissionKeys.reduce((permission, key) => {
                return this.rolesService.getRole(key) || this.permissionsService.getPermission(key) || permission
              }, false)
            : true
          return anyPermission
        }
        return true
      })
    })
  )
}
