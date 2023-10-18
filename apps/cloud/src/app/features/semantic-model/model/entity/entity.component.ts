import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import { ChangeDetectionStrategy, Component, HostBinding, OnInit, inject } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router, UrlSegment } from '@angular/router'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { NxSettingsPanelService } from '@metad/story/designer'
import { ToastrService } from 'apps/cloud/src/app/@core'
import { isNil, negate } from 'lodash-es'
import { of } from 'rxjs'
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators'
import { AppService } from '../../../../app.service'
import { SemanticModelService } from '../model.service'
import { ModelEntityService } from './entity.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { ModelCopilotEngineService } from '../copilot'

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'pac-model-entity',
  templateUrl: 'entity.component.html',
  styleUrls: ['entity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ModelEntityService, NxSettingsPanelService]
})
export class ModelEntityComponent implements OnInit {

  public appService = inject(AppService)
  private modelService = inject(SemanticModelService)
  private entityService = inject(ModelEntityService)
  public settingsService = inject(NxSettingsPanelService)
  public copilotEngineService = inject(ModelCopilotEngineService)
  private toastrService = inject(ToastrService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)

  @HostBinding('class.pac-model-entity') _isModelEntity = true
  @HostBinding('class.pac-fullscreen')
  public isFullscreen = false

  private zIndex = 3
  detailsOpen = false

  public readonly cube = toSignal(this.entityService.cube$)

  public readonly entityId$ = this.route.paramMap.pipe(
    startWith(this.route.snapshot.paramMap),
    map((paramMap) => paramMap.get('id')),
    filter(negate(isNil)),
    map(decodeURIComponent),
    distinctUntilChanged()
  )
  // 当前子组件
  public readonly route$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    startWith({}),
    switchMap(() => this.route.firstChild?.url ?? of(null)),
    map((url: UrlSegment[]) => url?.[0]?.path)
  )

  public readonly isMobile$ = this.appService.isMobile$
  public readonly cube$ = this.entityService.cube$
  public readonly modelType$ = this.modelService.modelType$
  public readonly error$ = this.entityService.entityName$.pipe(
    switchMap((entity) => this.modelService.selectEntitySetError(entity))
  )

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private entitySub = this.entityId$.pipe(untilDestroyed(this)).subscribe((id) => {
    this.entityService.init(id)
    this.modelService.setCrrentEntity(id)
  })

  private errorSub = this.error$.pipe(untilDestroyed(this)).subscribe((err) => {
    this.toastrService.error(err)
  })
  
  ngOnInit() {
    this.entityService.setSelectedProperty(null)
    this.copilotEngineService.entityService = this.entityService
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex)
    }
  }

  onDesignerDrawerChange(opened: boolean) {
    this.detailsOpen = opened
    this.settingsService.setEditable(opened)
  }

  openCubeDesigner() {
    this.entityService.setSelectedProperty(null)
    this.settingsService.setEditable(true)
    this.detailsOpen = true
  }

  openSub(event) {
    this.router.navigate([event + '/'], { relativeTo: this.route })
  }

  propertySelectedChange(selected: string) {
    this.entityService.setSelectedProperty(selected)
    this.detailsOpen = true
  }

  onPropertyEdit(event) {
    this.router.navigate([`calculation/${event.__id__}`], { relativeTo: this.route })
  }

  toggleFullscreen() {
    if (this.isFullscreen) {
      this.appService.exitFullscreen(this.zIndex)
      this.isFullscreen = false
    } else {
      this.appService.requestFullscreen(this.zIndex)
      this.isFullscreen = true
    }
  }
}
