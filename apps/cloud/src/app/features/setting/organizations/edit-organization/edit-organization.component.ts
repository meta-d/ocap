import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { TranslateService } from '@ngx-translate/core'
import { IOrganization } from '@metad/contracts'
import { filter, map, shareReplay, switchMap } from 'rxjs/operators'
import { EmployeesService, OrganizationsService, PermissionsEnum, Store } from '../../../../@core'

@UntilDestroy({ checkProperties: true })
@Component({
  templateUrl: './edit-organization.component.html',
  styleUrls: ['./edit-organization.component.scss']
})
export class EditOrganizationComponent implements OnInit {

  public readonly organization$ = this.route.params.pipe(
    map((params) => params.id),
    switchMap((id) => this.organizationsService.getById(id, null, ['tags'])),
    shareReplay(1)
  )

  selectedOrg: IOrganization
  selectedOrgFromHeader: IOrganization
  employeesCount: number
  params: any

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private organizationsService: OrganizationsService,
    private employeesService: EmployeesService,
    private store: Store,
    readonly translateService: TranslateService
  ) {}

  async ngOnInit() {
    this.organization$.pipe(untilDestroyed(this)).subscribe((organization) => {
      this.setSelectedOrg(organization)
    })

    this.store.selectedOrganization$
      .pipe(
        filter((organization) => !!organization),
        untilDestroyed(this)
      )
      .subscribe((organization) => {
        this.setSelectedOrg(organization)
      })
  }

  setSelectedOrg(selectedOrg) {
    this.store.selectedEmployee = null
    this.selectedOrg = selectedOrg
    this.store.selectedOrganization = this.selectedOrg
    this.store.organizationId = this.selectedOrg.id
    this.selectedOrgFromHeader = this.selectedOrg
  }

  // canEditPublicPage() {
  //   return this.store.hasPermission(PermissionsEnum.PUBLIC_PAGE_EDIT)
  // }

  // private async loadEmployeesCount() {
  //   const { tenantId } = this.store.user
  //   const { total } = await firstValueFrom(
  //     this.employeesService.getAll([], {
  //       organizationId: this.selectedOrg.id,
  //       tenantId
  //     })
  //   )
  //   this.employeesCount = total
  // }
}
