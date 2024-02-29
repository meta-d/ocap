import { Location } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  Renderer2,
  ViewChild,
  effect,
  inject
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { MatDialog } from '@angular/material/dialog'
import { MatDrawerMode, MatSidenav, MatSidenavContainer } from '@angular/material/sidenav'
import {
  Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterEvent
} from '@angular/router'
import { PacMenuItem } from '@metad/cloud/auth'
import { UsersService } from '@metad/cloud/state'
import { isNotEmpty, nonNullable } from '@metad/core'
import { NgmCopilotChatComponent } from '@metad/ocap-angular/copilot'
import { TranslateService } from '@ngx-translate/core'
import { NGXLogger } from 'ngx-logger'
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions'
import { NgxPopperjsPlacements, NgxPopperjsTriggers } from 'ngx-popperjs'
import { combineLatestWith, firstValueFrom } from 'rxjs'
import { filter, map, startWith, tap } from 'rxjs/operators'
import {
  AbilityActions,
  AnalyticsFeatures,
  AnalyticsFeatures as AnalyticsFeaturesEnum,
  AnalyticsPermissionsEnum,
  EmployeesService,
  FeatureEnum,
  IOrganization,
  IRolePermission,
  IUser,
  MenuCatalog,
  PermissionsEnum,
  RolesEnum,
  SelectorService,
  Store,
  routeAnimations
} from '../@core'
import { StoryCreationComponent } from '../@shared'
import { AppService } from '../app.service'
import { ModelCreationComponent } from './semantic-model/creation/creation.component'
import { QueryCreationDialogComponent } from './semantic-model/query-creation.component'
import { CopilotEngine } from '@metad/copilot'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
  animations: [routeAnimations]
})
export class FeaturesComponent implements OnInit {
  MENU_CATALOG = MenuCatalog
  NgxPopperjsTriggers = NgxPopperjsTriggers
  NgxPopperjsPlacements = NgxPopperjsPlacements
  AbilityActions = AbilityActions

  readonly #destroyRef = inject(DestroyRef)

  @ViewChild('sidenav') sidenav: MatSidenav
  @ViewChild('copilotChat') copilotChat!: NgmCopilotChatComponent

  copilotEngine: CopilotEngine
  sidenavMode = 'over' as MatDrawerMode
  sidenavOpened = false
  isEmployee: boolean
  organization: IOrganization
  user: IUser
  menu: PacMenuItem[] = []

  links = [
    {
      link: 'home',
      icon: 'home'
    },
    {
      link: 'story',
      icon: 'auto_stories'
    },
    {
      link: 'models',
      icon: 'apartment'
    }
  ]
  activeLink = 'home'
  readonly isMobile = toSignal(this.appService.isMobile$)
  // zIndex = 0
  get isAuthenticated() {
    return !!this.store.user
  }
  assetsSearch = ''
  readonly fullscreenIndex$ = toSignal(this.appService.fullscreenIndex$)
  public readonly isAuthenticated$ = this.store.user$
  public readonly navigation$ = this.appService.navigation$.pipe(
    filter(nonNullable),
    combineLatestWith(this.translateService.stream('PAC.KEY_WORDS')),
    map(([navigation, i18n]) => {
      let catalogName: string
      let icon: string
      switch (navigation.catalog) {
        case MenuCatalog.Project:
          catalogName = i18n?.['Project'] ?? 'Project'
          icon = 'auto_stories'
          break
        case MenuCatalog.Stories:
          catalogName = i18n?.['STORY'] || 'Story'
          icon = 'auto_stories'
          break
        case MenuCatalog.Models:
          catalogName = i18n?.['MODEL'] || 'Model'
          // icon = 'database'
          icon = 'view_in_ar'
          break
        case MenuCatalog.Settings:
          catalogName = i18n?.['SETTINGS'] || 'Settings'
          icon = 'manage_accounts'
          break
        case MenuCatalog.IndicatorApp:
          catalogName = i18n?.['IndicatorApp'] || 'Indicator App'
          icon = 'storefront'
          break
      }

      return {
        ...navigation,
        catalogName,
        icon
      }
    })
  )

  get isCollapsed() {
    return this.sidenavOpened && this.sidenavMode === 'side'
  }

  assetsInit = false
  showIntelligent = false
  loading = false
  isDark$ = this.appService.isDark$
  copilotDrawerOpened = false

  readonly copilotEnabled$ = toSignal(this.appService.copilotEnabled$)
  readonly user$ = toSignal(this.store.user$)

  private _userSub = this.store.user$
    .pipe(
      filter((user: IUser) => !!user),
      takeUntilDestroyed()
    )
    .subscribe((value) => {
      this.checkForEmployee()
      this.logger?.debug(value)
    })

  constructor(
    public readonly appService: AppService,
    private readonly employeeService: EmployeesService,
    private readonly store: Store,
    private readonly rolesService: NgxRolesService,
    private readonly ngxPermissionsService: NgxPermissionsService,
    private readonly usersService: UsersService,
    public readonly translateService: TranslateService,
    private readonly selectorService: SelectorService,
    protected renderer: Renderer2,
    private router: Router,
    public dialog: MatDialog,
    private location: Location,
    private logger: NGXLogger,
    private _cdr: ChangeDetectorRef
  ) {
    this.router.events
      .pipe(filter((e: Event | RouterEvent): e is RouterEvent => e instanceof RouterEvent))
      .subscribe((e: RouterEvent) => {
        this.navigationInterceptor(e)
        if (e instanceof NavigationEnd && this.sidenavMode === 'over') {
          this.sidenav.close()
        }
      })
    effect(() => {
      if (this.store.fixedLayoutSider()) {
        this.sidenavMode = 'side'
        this.sidenavOpened = true
      } else {
        this.sidenavMode = 'over'
        this.sidenavOpened = false
      }
    })
  }

  async ngOnInit() {
    await this._createEntryPoint()

    this.store.userRolePermissions$
      .pipe(
        filter((permissions: IRolePermission[]) => isNotEmpty(permissions)),
        map((permissions) => permissions.map(({ permission }) => permission)),
        tap((permissions) => this.ngxPermissionsService.loadPermissions(permissions)),
        combineLatestWith(this.translateService.onLangChange.pipe(startWith(null))),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe(([permissions]) => {
        this.menu = this.getMenuItems()
        this.loadItems(this.selectorService.showSelectors(this.router.url).showOrganizationShortcuts)
        this._cdr.detectChanges()
      })
  }

  /*
   * This is app entry point after login
   */
  private async _createEntryPoint() {
    const id = this.store.userId
    if (!id) return

    this.user = await this.usersService.getMe([
      'employee',
      'role',
      'role.rolePermissions',
      'tenant',
      'tenant.featureOrganizations',
      'tenant.featureOrganizations.feature'
    ])

    //When a new user registers & logs in for the first time, he/she does not have tenantId.
    //In this case, we have to redirect the user to the onboarding page to create their first organization, tenant, role.
    if (!this.user.tenantId) {
      this.router.navigate(['/onboarding/tenant'])
      return
    }

    this.store.user = this.user

    //tenant enabled/disabled features for relatives organizations
    const { tenant, role } = this.user
    this.store.featureTenant = tenant.featureOrganizations.filter((item) => !item.organizationId)

    //only enabled permissions assign to logged in user
    this.store.userRolePermissions = role.rolePermissions.filter((permission) => permission.enabled)
  }

  loadItems(withOrganizationShortcuts: boolean) {
    this.menu = this.menu.map((item) => {
      this.refreshMenuItem(item, withOrganizationShortcuts)
      return item
    })
  }

  refreshMenuItem(item, withOrganizationShortcuts) {
    item.title = this.getTranslation('PAC.MENU.' + item.data.translationKey, { Default: item.data.translationKey })
    if (item.data.permissionKeys || item.data.hide) {
      const anyPermission = item.data.permissionKeys
        ? item.data.permissionKeys.reduce((permission, key) => {
            return this.rolesService.getRole(key) || this.store.hasPermission(key) || permission
          }, false)
        : true

      item.hidden = !anyPermission || (item.data.hide && item.data.hide())

      if (anyPermission && item.data.organizationShortcut) {
        item.hidden = !withOrganizationShortcuts || !this.organization
        if (!item.hidden) {
          item.link = item.data.urlPrefix + this.organization.id + item.data.urlPostfix
        }
      }
    }

    // enabled/disabled features from here
    if (item.data.hasOwnProperty('featureKey') && item.hidden !== true) {
      const { featureKey } = item.data
      const enabled = !this.store.hasFeatureEnabled(featureKey)
      item.hidden = enabled || (item.data.hide && item.data.hide())
    }

    if (item.children) {
      item.children.forEach((childItem) => {
        this.refreshMenuItem(childItem, withOrganizationShortcuts)
      })
    }
  }

  getTranslation(prefix: string, params?: Object) {
    let result = ''
    this.translateService.get(prefix, params).subscribe((res) => {
      result = res
    })

    return result
  }

  checkForEmployee() {
    const { tenantId, id: userId } = this.store.user
    this.employeeService.getEmployeeByUserId(userId, [], { tenantId }).then(({ success }) => {
      this.isEmployee = success
    })
  }

  toggleSidenav(sidenav: MatSidenavContainer) {
    if (this.sidenavMode === 'over') {
      this.sidenavMode = 'side'
      setTimeout(() => {
        sidenav.ngDoCheck()
      }, 100)
      this.store.setFixedLayoutSider(true)
    } else {
      this.sidenav.toggle()
      setTimeout(() => {
        this.store.setFixedLayoutSider(false)
      }, 100)
    }
  }

  onLink(item) {
    this.activeLink = item.link
    this.router.navigate([item.link])
  }

  navigate(link: MenuCatalog) {
    switch (link) {
      case MenuCatalog.Stories:
        this.router.navigate(['/project'])
        break
      case MenuCatalog.Models:
        this.router.navigate(['/models'])
        break
      case MenuCatalog.Settings:
        this.router.navigate(['/settings'])
        break
    }
  }

  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.loading = true
    }
    if (event instanceof NavigationEnd) {
      this.loading = false
      if (event.url.match(/^\/project/g)) {
        this.appService.setCatalog({
          catalog: MenuCatalog.Project
        })
      } else if (event.url.match(/^\/project/g)) {
        this.appService.setCatalog({
          catalog: MenuCatalog.Stories
        })
      } else if (event.url.match(/^\/story/g)) {
      } else if (event.url.match(/^\/models/g)) {
        // this.appService.setCatalog({
        //   catalog: MenuCatalog.Models,
        //   id: !event.url.match(/^\/models$/g)
        // })
      } else if (event.url.match(/^\/settings/g)) {
        this.appService.setCatalog({
          catalog: MenuCatalog.Settings,
          id: !event.url.match(/^\/settings$/g)
        })
      } else if (event.url.match(/^\/indicator-app/g)) {
        this.appService.setCatalog({
          catalog: MenuCatalog.IndicatorApp
        })
      } else {
        this.appService.setCatalog({ catalog: null })
      }
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.loading = false
    }
    if (event instanceof NavigationError) {
      this.loading = false
    }

    this._cdr.detectChanges()
  }

  back(): void {
    this.location.back()
  }

  onMenuClicked(event, isMobile) {
    // this.isCollapsed = true
    // if (isMobile) {
    //   this.isCollapsedHidden = true
    // }
  }

  toggleDark() {
    this.appService.toggleDark()
  }

  getMenuItems(): PacMenuItem[] {
    return [
      {
        title: 'Home',
        matIcon: 'home',
        link: '/home',
        pathMatch: 'prefix',
        home: true,
        data: {
          translationKey: 'Home',
          featureKey: FeatureEnum.FEATURE_DASHBOARD
        },
        children: [
          {
            title: 'Today',
            matIcon: 'today',
            link: '/home',
            data: {
              translationKey: 'Today',
              featureKey: FeatureEnum.FEATURE_DASHBOARD
            }
          },
          {
            title: 'Catalog',
            matIcon: 'subscriptions',
            link: '/home/catalog',
            data: {
              translationKey: 'Catalog',
              featureKey: FeatureEnum.FEATURE_DASHBOARD
            }
          },
          {
            title: 'Trending',
            matIcon: 'timeline',
            link: '/home/trending',
            data: {
              translationKey: 'Trending',
              featureKey: FeatureEnum.FEATURE_DASHBOARD
            }
          },
          {
            title: 'Insights',
            matIcon: 'insights',
            link: '/home/insight',
            data: {
              translationKey: 'Insights',
              featureKey: AnalyticsFeatures.FEATURE_INSIGHT
            }
          }
        ]
      },

      {
        title: 'Semantic Model',
        matIcon: 'view_in_ar',
        link: '/models',
        pathMatch: 'prefix',
        data: {
          translationKey: 'Semantic Model',
          featureKey: AnalyticsFeatures.FEATURE_MODEL,
          permissionKeys: [AnalyticsPermissionsEnum.MODELS_EDIT]
        }
      },
      {
        title: 'Project',
        matIcon: 'dashboard',
        link: '/project',
        pathMatch: 'prefix',
        data: {
          translationKey: 'Project',
          featureKey: AnalyticsFeatures.FEATURE_STORY,
          permissionKeys: [AnalyticsPermissionsEnum.STORIES_VIEW]
        },
        children: [
          {
            title: 'Story',
            matIcon: 'auto_stories',
            link: '/project',
            data: {
              translationKey: 'Story',
              featureKey: AnalyticsFeatures.FEATURE_STORY,
              permissionKeys: [AnalyticsPermissionsEnum.STORIES_VIEW]
            }
          },
          {
            title: 'Indicators',
            matIcon: 'trending_up',
            link: '/project/indicators',
            data: {
              translationKey: 'Indicators',
              featureKey: AnalyticsFeatures.FEATURE_STORY,
              permissionKeys: [AnalyticsPermissionsEnum.STORIES_VIEW]
            }
          }
        ]
      },
      {
        title: 'Indicator Market',
        matIcon: 'local_grocery_store',
        link: '/indicator/market',
        data: {
          translationKey: 'Indicator Market',
          featureKey: AnalyticsFeaturesEnum.FEATURE_INDICATOR_MARKET,
          permissionKeys: [AnalyticsPermissionsEnum.INDICATOR_MARTKET_VIEW]
        }
      },
      {
        title: 'Indicator App',
        matIcon: 'trending_up',
        pathMatch: 'prefix',
        link: '/indicator-app',
        data: {
          translationKey: 'Indicator App',
          featureKey: AnalyticsFeaturesEnum.FEATURE_INDICATOR
        }
      },
      // {
      //   title: 'Subscription',
      //   icon: 'alert',
      //   pathMatch: 'prefix',
      //   link: '/subscription',
      //   data: {
      //     translationKey: 'MENU.INSIGHT',
      //     featureKey: AnalyticsFeatures.FEATURE_SUBSCRIPTION
      //   }
      // },

      {
        title: 'Data Sources',
        matIcon: 'settings_remote',
        link: '/settings/data-sources',
        admin: true,
        data: {
          translationKey: 'Data Sources',
          permissionKeys: [AnalyticsPermissionsEnum.DATA_SOURCE_EDIT],
          featureKey: AnalyticsFeatures.FEATURE_MODEL
        }
      },
      // {
      //   title: 'Notification Destinations',
      //   icon: 'robot',
      //   link: '/settings/notification-destinations',
      //   admin: true,
      //   data: {
      //     translationKey: 'PAC.KEY_WORDS.NOTIFICATION_DESTINATION',
      //     permissionKeys: [AnalyticsPermissionsEnum.DATA_SOURCE_EDIT]
      //     // featureKey: AnalyticsFeatures.FEATURE_A
      //   }
      // },

      {
        title: 'Settings',
        matIcon: 'settings',
        link: '/settings',
        admin: true,
        data: {
          translationKey: 'Settings',
          featureKey: FeatureEnum.FEATURE_SETTING
        },
        children: [
          {
            title: 'Account',
            matIcon: 'account_circle',
            link: '/settings/account',
            data: {
              translationKey: 'Account'
            }
          },
          {
            title: 'User',
            matIcon: 'people',
            link: '/settings/users',
            data: {
              translationKey: 'User',
              permissionKeys: [PermissionsEnum.ORG_USERS_EDIT],
              featureKey: FeatureEnum.FEATURE_USER
            }
          },
          {
            title: 'Roles',
            matIcon: 'supervisor_account',
            link: '/settings/roles',
            data: {
              translationKey: 'Role & Permission',
              featureKey: FeatureEnum.FEATURE_ROLES_PERMISSION,
              permissionKeys: [PermissionsEnum.CHANGE_ROLES_PERMISSIONS]
            }
          },
          {
            title: 'Business Area',
            matIcon: 'workspaces',
            link: '/settings/business-area',
            pathMatch: 'prefix',
            data: {
              translationKey: 'Business Area',
              featureKey: AnalyticsFeatures.FEATURE_BUSINESS_AREA,
              permissionKeys: [AnalyticsPermissionsEnum.BUSINESS_AREA_EDIT]
            }
          },

          {
            title: 'Certification',
            matIcon: 'verified_user',
            link: '/settings/certification',
            pathMatch: 'prefix',
            data: {
              translationKey: 'Certification',
              // 同语义模型的功能绑定一起启用与否
              featureKey: AnalyticsFeatures.FEATURE_MODEL,
              permissionKeys: [AnalyticsPermissionsEnum.CERTIFICATION_EDIT]
            }
          },

          {
            title: 'Email Templates',
            matIcon: 'email',
            link: '/settings/email-templates',
            data: {
              translationKey: 'Email Template',
              permissionKeys: [PermissionsEnum.VIEW_ALL_EMAIL_TEMPLATES],
              featureKey: FeatureEnum.FEATURE_EMAIL_TEMPLATE
            }
          },
          {
            title: 'Custom SMTP',
            matIcon: 'alternate_email',
            link: '/settings/custom-smtp',
            data: {
              translationKey: 'Custom SMTP',
              permissionKeys: [PermissionsEnum.CUSTOM_SMTP_VIEW],
              featureKey: FeatureEnum.FEATURE_SMTP
            }
          },

          {
            title: 'Copilot',
            matIcon: 'assistant',
            link: '/settings/copilot',
            data: {
              translationKey: 'Copilot',
              permissionKeys: [PermissionsEnum.ORG_COPILOT_EDIT],
              featureKey: FeatureEnum.FEATURE_COPILOT
            }
          },

          {
            title: 'Features',
            matIcon: 'widgets',
            link: '/settings/features',
            data: {
              translationKey: 'Feature',
              permissionKeys: [RolesEnum.SUPER_ADMIN]
            }
          },
          {
            title: 'Organizations',
            matIcon: 'corporate_fare',
            link: '/settings/organizations',
            data: {
              translationKey: 'Organization',
              permissionKeys: [RolesEnum.SUPER_ADMIN]
            }
          },
          {
            title: 'Tenant',
            // icon: 'cluster',
            matIcon: 'storage',
            link: '/settings/tenant',
            data: {
              translationKey: 'Tenant',
              permissionKeys: [RolesEnum.SUPER_ADMIN]
            }
          }
        ]
      }
    ]
  }

  async createQuery() {
    const query = await firstValueFrom(this.dialog.open(QueryCreationDialogComponent).afterClosed())
    if (query) {
      this.router.navigate(['models', query.modelId, 'query', query.key])
    }
  }

  async createStory() {
    const story = await firstValueFrom(
      this.dialog
        .open(StoryCreationComponent, {
          data: {}
        })
        .afterClosed()
    )

    if (story) {
      this.router.navigate(['story', story.id, 'edit'])
    }
  }

  async createModel() {
    const model = await firstValueFrom(this.dialog.open(ModelCreationComponent, { data: {} }).afterClosed())
    if (model) {
      this.router.navigate(['models', model.id])
    }
  }

  async createIndicator() {
    this.router.navigate(['project', 'indicators', 'new'])
  }

  toEnableCopilot() {
    this.router.navigate(['settings', 'copilot'])
  }
}
