import { Component, ElementRef, HostBinding, OnInit, Renderer2, computed, effect, inject, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { NxCoreService } from '@metad/core'
import { NxStoryService, Story } from '@metad/story/core'
import { map } from 'rxjs/operators'
import { AgentType, registerWasmAgentModel } from '../../@core'
import { registerStoryThemes, subscribeStoryTheme } from '../../@theme'
import { AppService } from '../../app.service'

@Component({
  selector: 'pac-story-viewer',
  templateUrl: 'viewer.component.html',
  styleUrls: ['viewer.component.scss'],
  providers: [NxCoreService, NxStoryService]
})
export class StoryViewerComponent implements OnInit {
  private renderer = inject(Renderer2)
  private _elementRef = inject(ElementRef)
  private coreService = inject(NxCoreService)
  public appService = inject(AppService)
  private storyService = inject(NxStoryService)
  private route = inject(ActivatedRoute)
  private readonly wasmAgent = inject(WasmAgentService)

  readonly story = signal<Story>(null)
  readonly models = computed(() => this.story()?.models)
  pageKey: string
  widgetKey: string

  readonly isDark$ = this.appService.isDark$
  readonly isAuthenticated$ = this.appService.isAuthenticated$

  private _themeSub = subscribeStoryTheme(this.storyService, this.coreService, this.renderer, this._elementRef)
  private _echartsThemeSub = registerStoryThemes(this.storyService)
  private echartsThemeSub = registerStoryThemes(this.storyService)

  private backgroundSub = this.storyService.storyOptions$
    .pipe(map((options) => options?.preferences?.storyStyling?.backgroundColor), takeUntilDestroyed())
    .subscribe((backgroundColor) => {
      if (backgroundColor) {
        this.renderer.setStyle(this._elementRef.nativeElement, 'background-color', backgroundColor)
      }
    })

  constructor() {
    effect(() => {
      const models = this.models()
      models?.forEach((model) => {
        if (model?.agentType === AgentType.Wasm) {
          registerWasmAgentModel(this.wasmAgent, model)
        }
      })
    })
  }

  ngOnInit() {
    this.story.set(this.route.snapshot.data['story'])
    this.pageKey = this.route.snapshot.queryParamMap.get('pageKey')
    this.widgetKey = this.route.snapshot.queryParamMap.get('widgetKey')

    this.appService.isAuthenticated$.pipe(takeUntilDestroyed()).subscribe((isAuthenticated) => {
      this.storyService.setAuthenticated(isAuthenticated)
    })
  }

  @HostBinding('class.pac-story-viewer')
  get _storyViewerComponent() {
    return true
  }
}
