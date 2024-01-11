import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import { ChangeDetectionStrategy, Component, HostBinding, OnInit, inject } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, NavigationEnd, Router, UrlSegment } from '@angular/router'
import { injectCopilotCommand, injectMakeCopilotActionable } from '@metad/ocap-angular/copilot'
import { NxSettingsPanelService } from '@metad/story/designer'
import { ToastrService } from 'apps/cloud/src/app/@core'
import { isNil, negate } from 'lodash-es'
import { nanoid } from 'nanoid'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom, of } from 'rxjs'
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators'
import { z } from 'zod'
import { AppService } from '../../../../app.service'
import { zodToAnnotations } from '../copilot'
import { SemanticModelService } from '../model.service'
import { ModelEntityService } from './entity.service'
import { NX_STORY_STORE, NxStoryStore, Story, StoryModel } from '@metad/story/core'
import { ModelComponent } from '../model.component'

@Component({
  selector: 'pac-model-entity',
  templateUrl: 'entity.component.html',
  styleUrls: ['entity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ModelEntityService, NxSettingsPanelService]
})
export class ModelEntityComponent implements OnInit {
  readonly #logger = inject(NGXLogger)
  public appService = inject(AppService)
  private modelService = inject(SemanticModelService)
  private entityService = inject(ModelEntityService)
  public settingsService = inject(NxSettingsPanelService)
  private toastrService = inject(ToastrService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  readonly #storyStore = inject<NxStoryStore>(NX_STORY_STORE)
  readonly #model = inject(ModelComponent)

  @HostBinding('class.pac-model-entity') _isModelEntity = true
  @HostBinding('class.pac-fullscreen')
  public isFullscreen = false

  private zIndex = 3
  detailsOpen = false
  // Cube structure opened state
  drawerOpened = true

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
    filter((event) => event instanceof NavigationEnd),
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
  | Copilot
  |--------------------------------------------------------------------------
  */
  #createStoryCommand = injectCopilotCommand({
    name: 'story',
    description: 'Create a new story from the cube',
    examples: [`Create a new story`],
    systemPrompt: () => {
      let prompt = `Create a new story by the cube based on the prompt.
The cube is`
      return prompt
    },
    actions: [
      injectMakeCopilotActionable({
        name: 'create_story',
        description: 'Should always be used to properly format output',
        argumentAnnotations: [
          {
            name: 'story',
            type: 'object', // Add or change types according to your needs.
            description: 'The defination of story',
            required: true,
            properties: zodToAnnotations(
              z.object({
                name: z.string().describe(`The name of the story`),
                description: z.string().describe(`The description of the story`)
              })
            )
          }
        ],
        implementation: async (story: any) => {
          this.#logger.debug(`Create a new story:`, story)
          story.key = nanoid()
          this.createStory(story)
        }
      })
    ]
  })

  /**
  |--------------------------------------------------------------------------
  | Subscriptions (effect)
  |--------------------------------------------------------------------------
  */
  private entitySub = this.entityId$.pipe(takeUntilDestroyed()).subscribe((id) => {
    this.entityService.init(id)
    this.modelService.setCrrentEntity(id)
  })

  private errorSub = this.error$.pipe(takeUntilDestroyed()).subscribe((err) => {
    this.toastrService.error(err)
  })

  ngOnInit() {
    this.entityService.setSelectedProperty(null)
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

  async createStory(story: Partial<Story>) {
    try {
      const newStory = await firstValueFrom(
        this.#storyStore.createStory({
          ...story,
          model: {
            id: this.#model.model.id
          } as StoryModel,
          businessAreaId: this.#model.model.businessAreaId
        })
      )
      
      this.openStory(newStory.id)
    } catch (err) {
      this.toastrService.error(err, 'PAC.MODEL.MODEL.CreateStory')
    }
  }

  openStory(id: string) {
    this.router.navigate([`/story/${id}/edit`])
  }
}
