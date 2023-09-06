import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { Ability, AbilityBuilder } from '@casl/ability'
import { IUser } from '@metad/contracts'
import { ThemesEnum, UsersService } from '@metad/cloud/state'
import * as Sentry from "@sentry/angular";
import { NgxPermissionsService } from 'ngx-permissions'
import { AuthStrategy } from '../../@core/auth/auth-strategy.service'
import { Store } from '../../@core/services/store.service'
import { PACThemeService } from '../theme'
import { AbilityActions, RolesEnum } from '../types'

@Injectable({ providedIn: 'root' })
export class AppInitService {
  user: IUser

  constructor(
    private readonly usersService: UsersService,
    private readonly authStrategy: AuthStrategy,
    private readonly router: Router,
    private readonly store: Store,
    private readonly ngxPermissionsService: NgxPermissionsService,
    private readonly ability: Ability,
    private readonly themeService: PACThemeService
  ) {}

  async init() {
    try {
      const id = this.store.userId
      if (id) {
        this.user = await this.usersService.getMe([
          'employee',
          'role',
          'role.rolePermissions',
          'tenant',
          'tenant.featureOrganizations',
          'tenant.featureOrganizations.feature'
        ])

        // this.authStrategy.electronAuthentication({
        // 	user: this.user,
        // 	token: this.store.token
        // });

        //When a new user registers & logs in for the first time, he/she does not have tenantId.
        //In this case, we have to redirect the user to the onboarding page to create their first organization, tenant, role.
        if (!this.user?.tenantId) {
          this.router.navigate(['/onboarding/tenant'])
          return
        }

        this.store.user = this.user

        //tenant enabled/disabled features for relatives organizations
        const { tenant } = this.user
        this.store.featureTenant = tenant.featureOrganizations.filter((item) => !item.organizationId)

        //only enabled permissions assign to logged in user
        this.store.userRolePermissions = this.user.role.rolePermissions.filter((permission) => permission.enabled)

        if (this.user.preferredLanguage && !this.store.preferredLanguage) {
          this.store.preferredLanguage = this.user.preferredLanguage
        }

        const permissions = this.store.userRolePermissions.map(({ permission }) => permission)
        this.ngxPermissionsService.loadPermissions(permissions)

        this.updateAbility(this.user)

        // Sentry identify user
        Sentry.setUser({ id: this.user.id, email: this.user.email, username: this.user.username })
      }
    } catch (error) {
      console.log(error)
    }
  }

  private updateAbility(user: IUser) {
    const { can, rules } = new AbilityBuilder(Ability)

    if (user.role.name === RolesEnum.SUPER_ADMIN) {
      can(AbilityActions.Manage, 'all')
      can(AbilityActions.Manage, 'Organization')
    } else {
      can('read', 'all')
      // can(AbilityActions.Manage, 'Story', { createdById: user.id })

      if (
        user.role.name === RolesEnum.ADMIN ||
        user.role.name === RolesEnum.DATA_ENTRY ||
        user.role.name === RolesEnum.TRIAL
      ) {
        can(AbilityActions.Manage, 'Story')
        can(AbilityActions.Create, 'Story')
      }
    }

    this.ability.update(rules)
  }
}
