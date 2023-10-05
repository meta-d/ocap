import { Component, OnDestroy, computed, effect, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { BusinessAreasService } from '@metad/cloud/state'
import { TranslateModule } from '@ngx-translate/core'
import { MaterialModule } from 'apps/cloud/src/app/@shared'
import { BehaviorSubject, distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs'
import { BusinessAreaInfoFormComponent } from '../area-info-form/area-info-form.component'
import { BusinessAreaUsersComponent } from '../area-users/area-users.component'
import { BusinessAreaComponent } from '../business-area.component'
import { BusinessType } from '@metad/contracts'

@Component({
  standalone: true,
  selector: 'pac-edit-business-area',
  templateUrl: './business-area.component.html',
  styleUrls: ['./business-area.component.scss'],
  imports: [MaterialModule, TranslateModule, BusinessAreaInfoFormComponent, BusinessAreaUsersComponent]
})
export class EditBusinessAreaComponent implements OnDestroy {
  BUSINESS_AREA_TYPE = BusinessType

  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private businessAreasService = inject(BusinessAreasService)
  private businessAreaComponent = inject(BusinessAreaComponent)

  public readonly businessAreaId$ = this.route.params.pipe(
    startWith(this.route.snapshot.params),
    map((params) => params?.id),
    filter((id) => !!id),
    distinctUntilChanged()
  )

  private readonly refresh$ = new BehaviorSubject<void>(null)

  public readonly businessArea = toSignal(
    this.businessAreaId$.pipe(
      switchMap((id) => this.refresh$.pipe(switchMap(() => this.businessAreasService.getById(id))))
    )
  )

  public readonly name = computed(() => this.businessArea()?.name)

  constructor() {
    effect(
      () => {
        if (this.businessArea()) {
          this.businessAreaComponent.setCurrentLink(this.businessArea())
        }
      },
      { allowSignalWrites: true }
    )
  }

  refresh() {
    this.refresh$.next()
  }

  ngOnDestroy(): void {
    this.businessAreaComponent.setCurrentLink(null)
  }
}
