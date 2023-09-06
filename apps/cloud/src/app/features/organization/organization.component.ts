import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators'

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'pac-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent {
  public id$ = this.route.paramMap.pipe(
    startWith(this.route.snapshot.paramMap),
    map((paramMap) => paramMap.get('id')),
    filter(Boolean),
    map(decodeURIComponent),
    distinctUntilChanged(),
    untilDestroyed(this)
  )
  constructor(private route: ActivatedRoute) {}
}
