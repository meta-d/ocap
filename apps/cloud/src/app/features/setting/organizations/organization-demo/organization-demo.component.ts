import { Component } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { OrganizationsService, ToastrService } from 'apps/cloud/src/app/@core'
import { TranslationBaseComponent } from 'apps/cloud/src/app/@shared'
import { catchError, concatMap, EMPTY, Observable, tap, withLatestFrom } from 'rxjs'
import { EditOrganizationComponent } from '../edit-organization/edit-organization.component'
import { effectAction } from '@metad/ocap-angular/core'

@UntilDestroy({ checkProperties: true })
@Component({
  templateUrl: './organization-demo.component.html',
  styleUrls: ['./organization-demo.component.scss']
})
export class OrganizationDemoComponent extends TranslationBaseComponent {
  constructor(
    public editOrganizationComponent: EditOrganizationComponent,
    private orgsService: OrganizationsService,
    private readonly _toastrService: ToastrService
  ) {
    super()
  }

  readonly generate = effectAction((origin$: Observable<void>) => {
    return origin$.pipe(
      withLatestFrom(this.editOrganizationComponent.organization$),
      concatMap(([, org]) => {
        return this.orgsService.demo(org.id).pipe(
          catchError((err) => {
            this._toastrService.error('PAC.NOTES.ORGANIZATIONS.DEMO_GENERATE_ERROR')
            return EMPTY
          })
        )
      }),
      tap(() => {
        this._toastrService.success('PAC.NOTES.ORGANIZATIONS.DEMO_GENERATED')
      })
    )
  })
}
