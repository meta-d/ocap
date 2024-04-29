import { CommonModule, DOCUMENT } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Renderer2,
  ViewChild,
  inject
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute } from '@angular/router'
import { NgmDSCoreService, NgmSmartFilterBarService, effectAction } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { AgentType, omit } from '@metad/ocap-core'
import { ContentLoaderModule } from '@ngneat/content-loader'
import { TranslateModule } from '@ngx-translate/core'
import { StoryPointsService, convertStoryResult } from '@metad/cloud/state'
import { NgmTransformScaleDirective, NxCoreService } from '@metad/core'
import { NxStoryService } from '@metad/story/core'
import { NxStoryModule, NxStoryPointComponent, NxStoryPointService } from '@metad/story/story'
import { BehaviorSubject, EMPTY, Observable, interval } from 'rxjs'
import { catchError, distinctUntilChanged, filter, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators'
import { exitFullscreen, registerWasmAgentModel, requestFullscreen } from '../../../@core'
import { MaterialModule, TranslationBaseComponent } from '../../../@shared'
import { _effectStoryTheme, registerStoryThemes } from '../../../@theme'
import { AppService } from '../../../app.service'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-public-point',
  templateUrl: 'point.component.html',
  styleUrls: ['point.component.scss'],
  host: {
    class: 'pac-story-point'
  },
  providers: [NgmDSCoreService, NxStoryService, NxStoryPointService, NgmSmartFilterBarService, NxCoreService],
  imports: [
    CommonModule,
    NxStoryModule,
    MaterialModule,
    TranslateModule,
    ContentLoaderModule,
    NgmTransformScaleDirective
  ]
})
export class StoryPointComponent extends TranslationBaseComponent {
  public appService = inject(AppService)
  public storyService = inject(NxStoryService)
  private pointsService = inject(StoryPointsService)
  private wasmAgent = inject(WasmAgentService)
  private route = inject(ActivatedRoute)
  private _renderer = inject(Renderer2)
  private _elementRef = inject(ElementRef)
  private document: any = inject(DOCUMENT)

  @ViewChild(NxStoryPointComponent) storyPointComponent: NxStoryPointComponent

  @HostBinding('class.fullscreen')
  fullscreen = false
  timer: number
  /**
   * X minutes scheduler to refresh story data
   */
  Schedulers = [1, 5, 10, 15, 30, 60]

  public readonly pointId$ = this.route.params.pipe(
    startWith(this.route.snapshot.params),
    map((params) => params?.id),
    filter((id) => !!id),
    distinctUntilChanged()
  )

  public readonly storyPoint$ = this.pointId$.pipe(
    switchMap((id) =>
      this.pointsService
        .getOne(id, [
          'widgets',
          'story',
          // 'story.model',
          // 'story.model.dataSource',
          // 'story.model.dataSource.type',
          // 'story.model.indicators',

          'story.models',
          'story.models.dataSource',
          'story.models.dataSource.type',
          'story.models.indicators',

          // 'story.points',
          'createdBy'
        ])
        .pipe(
          catchError((err) => {
            this.error$.next(err.error)
            return EMPTY
          })
        )
    ),
    takeUntilDestroyed(),
    shareReplay(1)
  )

  public readonly pointKey = toSignal(this.storyPoint$.pipe(map((point) => point.key)))

  public readonly story$ = this.storyPoint$.pipe(
    map((point) => {
      return convertStoryResult({
        ...point.story,
        points: [omit(point, 'story')]
      })
    }),
    tap((story) => {
      story.models?.forEach((model) => {
        if (model.agentType === AgentType.Wasm) {
          registerWasmAgentModel(this.wasmAgent, model)
        }
      })

      if (story.options?.fullscreen) {
        this.toggleFullscreen(true)
      }
    })
  )

  public error$ = new BehaviorSubject(null)

  public readonly storySizeStyles = toSignal(this.storyService.storySizeStyles$)

  // private _themeSub = subscribeStoryTheme(this.storyService, this.coreService, this._renderer, this._elementRef)
  private _echartsThemeSub = registerStoryThemes(this.storyService)
  private _storyChanged = this.story$.pipe(takeUntilDestroyed()).subscribe((story) => {
    if (story) {
      this.storyService.setStory(story)
    }
  })

  private backgroundSub = this.storyService.preferences$
    .pipe(map((preferences) => preferences?.storyStyling?.backgroundColor), takeUntilDestroyed())
    .subscribe((backgroundColor) => {
      if (backgroundColor) {
        this._renderer.setStyle(this._elementRef.nativeElement, 'background-color', backgroundColor)
      }
    })

  constructor() {
    super()
    
    _effectStoryTheme(this._elementRef)
  }

  async toggleFullscreen(fullscreen?: boolean) {
    this.fullscreen = fullscreen ?? !this.fullscreen
    if (this.fullscreen) {
      requestFullscreen(this.document)
      this.appService.requestFullscreen(2)
    } else {
      exitFullscreen(this.document)
      this.appService.exitFullscreen(2)
    }
  }

  readonly timerUpdate = effectAction((timer$: Observable<number>) => {
    return timer$.pipe(
      tap((t) => (this.timer = t)),
      switchMap((t) => (t ? interval(t * 1000 * 60) : EMPTY)),
      tap(() => this.storyPointComponent.refresh())
    )
  })
}
