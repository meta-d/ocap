import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import { ChangeDetectionStrategy, Component, HostBinding, OnInit, inject } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, NavigationEnd, Router, RouterModule, UrlSegment } from '@angular/router'
import { injectCopilotCommand, injectMakeCopilotActionable } from '@metad/ocap-angular/copilot'
import { NxDesignerModule, NxSettingsPanelService } from '@metad/story/designer'
import { ToastrService } from 'apps/cloud/src/app/@core'
import { isNil, negate } from 'lodash-es'
import { nanoid } from 'nanoid'
import { NGXLogger } from 'ngx-logger'
import { firstValueFrom, of } from 'rxjs'
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators'
import { z } from 'zod'
import { AppService } from '../../../../app.service'
import { CalculatedMeasureSchema, zodToAnnotations } from '../copilot'
import { SemanticModelService } from '../model.service'
import { ModelEntityService } from './entity.service'
import { NX_STORY_STORE, NxStoryStore, Story, StoryModel } from '@metad/story/core'
import { ModelComponent } from '../model.component'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MaterialModule } from 'apps/cloud/src/app/@shared'
import { TranslateModule } from '@ngx-translate/core'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { ModelCubeStructureComponent } from './cube-structure/cube-structure.component'
import { C_MEASURES, CalculatedMember, isEntitySet } from '@metad/ocap-core'
import { calcEntityTypePrompt, makeCubePrompt, nonBlank, routeAnimations } from '@metad/core'

@Component({
  standalone: true,
  selector: 'pac-model-entity',
  templateUrl: 'entity.component.html',
  styleUrls: ['entity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ModelEntityService, NxSettingsPanelService],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    RouterModule,
    TranslateModule,
    NgmCommonModule,
    NxDesignerModule,
    ModelCubeStructureComponent
  ],
  animations: [routeAnimations]
})
export class ModelEntityComponent implements OnInit {
  readonly #logger = inject(NGXLogger)
  public appService = inject(AppService)
  private modelService = inject(SemanticModelService)
  private entityService = inject(ModelEntityService)
  public settingsService = inject(NxSettingsPanelService)
  readonly #toastr = inject(ToastrService)
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

  /**
  |--------------------------------------------------------------------------
  | Signals
  |--------------------------------------------------------------------------
  */
  readonly isMobile = toSignal(this.appService.isMobile$)
  public readonly modelType$ = this.modelService.modelType$
  readonly entityType = this.entityService.entityType
  readonly cube = toSignal(this.entityService.cube$)

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
          return `✅`
        }
      })
    ]
  })

  #calculatedMeasureCommand = injectCopilotCommand({
    name: 'calc',
    description: 'Create a new calculated measure',
    systemPrompt: () => {
      let prompt = `Create a new MDX calculated measure for the cube based on the prompt.`
      if (this.entityType()) {
        prompt += `The cube is: 
\`\`\`
${calcEntityTypePrompt(this.entityType())}
\`\`\`
`
      } else {
        prompt += `The cube is:
\`\`\`
${makeCubePrompt(this.cube())}
\`\`\`
`
      }
   
      return prompt
    },
    actions: [
      injectMakeCopilotActionable({
        name: 'create-calculated-measure',
        description: 'Should always be used to properly format output',
        argumentAnnotations: [
          {
            name: 'measure',
            type: 'object', // Add or change types according to your needs.
            description: 'The defination of calculated measure',
            required: true,
            properties: zodToAnnotations(CalculatedMeasureSchema)
          }
        ],
        implementation: async (cm: CalculatedMember) => {
          this.#logger.debug(`Create a new calculated measure '${cm.name}' with formula '${cm.formula}'`)
          const key = cm.__id__ ?? nanoid()
          this.entityService.addCalculatedMeasure({
            ...cm,
            dimension: C_MEASURES,
            visible: true,
            __id__: key
          })

          this.entityService.navigateCalculation(key)

          return `✅`
        }
      }),
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

  /**
   * 监听当前实体类型变化, 将错误信息打印出来;
   * SQL Model / Olap Model: 用于验证 Schema 是否正确
   */
  private entityErrorSub = this.entityService.entityError$.pipe(
    filter(nonBlank),
    takeUntilDestroyed()
  ).subscribe((error) => {
    this.#toastr.error(error)
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
      this.#toastr.error(err, 'PAC.MODEL.MODEL.CreateStory')
    }
  }

  openStory(id: string) {
    this.router.navigate([`/story/${id}/edit`])
  }
}
