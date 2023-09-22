import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { PropertyHierarchy } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { nonBlank } from '@metad/core'
import { NxDesignerModule, NxSettingsPanelService } from '@metad/story/designer'
import { MaterialModule, SharedModule, TranslationBaseComponent } from 'apps/cloud/src/app/@shared'
import { Observable } from 'rxjs'
import { distinctUntilChanged, filter, map, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators'
import { ToastrService, routeAnimations } from '../../../../@core'
import { AppService } from '../../../../app.service'
import { ModelComponent } from '../model.component'
import { SemanticModelService } from '../model.service'
import { ModelDesignerType, TOOLBAR_ACTION_CATEGORY } from '../types'
import { ModelDimensionService } from './dimension.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { CommonModule } from '@angular/common'
import { ContentLoaderModule } from '@ngneat/content-loader'
import { NxTableModule } from '@metad/components/table'
import { OcapCoreModule, effectAction } from '@metad/ocap-angular/core'
import { NgmCommonModule, ResizerModule, SplitterModule } from '@metad/ocap-angular/common'
import { NgmEntitySchemaComponent } from '@metad/ocap-angular/entity'
import { TablesJoinModule } from '../../tables-join'

@UntilDestroy({ checkProperties: true })
@Component({
  standalone: true,
  selector: 'pac-model-dimension',
  templateUrl: 'dimension.component.html',
  styleUrls: ['dimension.component.scss'],
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ModelDimensionService, NxSettingsPanelService],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    ContentLoaderModule,
    
    NxTableModule,
    NxDesignerModule,
    
    OcapCoreModule,
    ResizerModule,
    SplitterModule,
    NgmEntitySchemaComponent,
    NgmCommonModule,

    TablesJoinModule
  ]
})
export class ModelDimensionComponent extends TranslationBaseComponent implements OnInit {
  detailsOpen = false

  public readonly hierarchies = toSignal(this.dimensionService.hierarchies$)
  public readonly dimension = toSignal(this.dimensionService.dimension$)

  public readonly isMobile$ = this.appService.isMobile$
  public readonly dimension$ = this.dimensionService.dimension$

  public readonly error$ = this.dimensionService.name$.pipe(
    switchMap((entity) => this.modelService.selectEntitySetError(entity))
  )
  constructor(
    public appService: AppService,
    public modelService: SemanticModelService,
    private modelComponent: ModelComponent,
    private dimensionService: ModelDimensionService,
    public settingsService: NxSettingsPanelService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super()

    this.route.paramMap
      .pipe(
        startWith(this.route.snapshot.paramMap),
        map((paramMap) => paramMap.get('id')),
        filter(nonBlank),
        map(decodeURIComponent),
        distinctUntilChanged(),
        untilDestroyed(this)
      )
      .subscribe((id) => {
        this.dimensionService.init(id)
        this.modelService.setCrrentEntity(id)
      })

    this.error$.pipe(untilDestroyed(this)).subscribe((err) => {
      this.toastrService.error(err)
    })
  }

  ngOnInit(): void {
    this.openDesigner()
    this.settingsService.setEditable(true)

    this.modelComponent.toolbarAction$
      .pipe(
        untilDestroyed(this),
        filter(({ category, action }) => category === TOOLBAR_ACTION_CATEGORY.DIMENSION)
      )
      .subscribe(({ category, action }) => {
        if (action === 'NewHierarchy') {
          this.dimensionService.newHierarchy()
        } else if (action === 'RemoveHierarchy') {
          this.dimensionService.removeHierarchy('')
        }
      })
  }

  trackById(i: number, item: PropertyHierarchy) {
    return item.__id__
  }

  openDesignerPanel() {
    this.detailsOpen = true
  }

  readonly openDesigner = effectAction((origin$: Observable<void>) => {
    return origin$.pipe(
      withLatestFrom(this.dimension$),
      switchMap(([, dimension]) =>
        this.settingsService.openDesigner(
          ModelDesignerType.dimension,
          this.dimension$.pipe(
            map((dimension) => ({ modeling: dimension, shared: true, hierarchies: dimension.hierarchies })),
          ),
          dimension.__id__
        )
      ),
      tap((result: { modeling }) => {
        this.dimensionService.update(result.modeling)
      })
    )
  })

  editDimension() {
    this.openDesignerPanel()
    this.openDesigner()
  }

  editHierarchy(key: string) {
    this.openDesignerPanel()
    this.dimensionService.setupHierarchyDesigner(key)
  }

  removeHierarchy(key: string) {
    this.dimensionService.removeHierarchy(key)
  }

  newHierarchy() {
    this.dimensionService.newHierarchy()
  }

  duplicateHierarchy(key: string) {
    this.dimensionService.duplicateHierarchy(key)
  }

  navigateTo(id: string) {
    this.router.navigate([`hierarchy/${id}`], { relativeTo: this.route })
  }
}
