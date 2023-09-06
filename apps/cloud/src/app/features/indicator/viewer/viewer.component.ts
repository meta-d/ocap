import { Component, OnInit, inject } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { IndicatorsService } from '@metad/cloud/state'
import { isNil, negate } from 'lodash-es'
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators'
import { AbilityActions, getDateLocale } from '../../../@core'
import { IndicatorTypeComponent } from '../../../@shared/indicator'
import { CommonModule } from '@angular/common'
import { CreatedByPipe, MaterialModule, TagViewerComponent } from '../../../@shared'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { FormsModule } from '@angular/forms'
import { NxSelectionModule } from '@metad/components/selection'
import formatRelative from 'date-fns/formatRelative'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MaterialModule,
    TranslateModule,
    
    CreatedByPipe,
    NxSelectionModule,
    IndicatorTypeComponent,
    TagViewerComponent
  ],
  selector: 'pac-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {
  AbilityActions = AbilityActions
  public readonly translateService = inject(TranslateService)
  
  public readonly indicator$ = this._route.paramMap.pipe(
    startWith(this._route.snapshot.paramMap),
    map((paramMap) => paramMap.get('id')),
    filter(negate(isNil)),
    distinctUntilChanged(),
    switchMap((id) => this.indicatorsService.getById(id, ['model', 'businessArea', 'createdBy', 'certification'])),
    map((indicator) => ({
      ...indicator,
      validity: formatRelative(new Date(indicator.validity), new Date(), { locale: getDateLocale(this.translateService.currentLang) }),
    } as any))
  )

  constructor(
    private indicatorsService: IndicatorsService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit() {}

  edit(id: string) {
    this._router.navigate(['../../edit/', id], { relativeTo: this._route })
  }

  delete(id: string) {
    this.indicatorsService.delete(id)
  }
}
