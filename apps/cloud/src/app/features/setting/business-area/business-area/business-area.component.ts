import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { BusinessAreasService, BusinessType } from '@metad/cloud/state'
import { distinctUntilChanged, filter, map, shareReplay, startWith, switchMap } from 'rxjs'

@UntilDestroy()
@Component({
  selector: 'pac-business-area',
  templateUrl: './business-area.component.html',
  styleUrls: ['./business-area.component.scss']
})
export class BusinessAreaComponent implements OnInit {
  BUSINESS_AREA_TYPE = BusinessType

  public readonly businessAreaId$ = this.route.params.pipe(
    startWith(this.route.snapshot.params),
    map((params) => params?.id),
    filter((id) => !!id),
    distinctUntilChanged()
  )

  public readonly businessArea$ = this.businessAreaId$.pipe(
    switchMap((id) => this.businessAreasService.getById(id)),
    untilDestroyed(this),
    shareReplay(1)
  )

  public readonly name$ = this.businessArea$.pipe(map((businessArea) => businessArea?.name))
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessAreasService: BusinessAreasService
  ) {}

  ngOnInit(): void {}
}
