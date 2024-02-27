import { computed, inject, Injectable, signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { convertNewSemanticModelResult, ModelsService, NgmSemanticModel } from '@metad/cloud/state'
import { CopilotChatMessageRoleEnum, CopilotService, getFunctionCall } from '@metad/copilot'
import { calcEntityTypePrompt, nonNullable } from '@metad/core'
import { NgmCopilotEngineService } from '@metad/ocap-angular/copilot'
import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { Cube, EntityType, isEntityType } from '@metad/ocap-core'
import { getSemanticModelKey } from '@metad/story/core'
import { TranslateService } from '@ngx-translate/core'
import JSON5 from 'json5'
import { uniq } from 'lodash-es'
import { nanoid } from 'nanoid'
import { NGXLogger } from 'ngx-logger'
import { computedAsync } from 'ngxtension/computed-async'
import { combineLatest, debounceTime, filter, firstValueFrom, map, of, switchMap } from 'rxjs'
import zodToJsonSchema from 'zod-to-json-schema'
import { registerModel } from '../../../@core'
import { DemoModelCubes, SuggestsSchema } from './types'

@Injectable()
export class InsightService {
  readonly #modelsService = inject(ModelsService)
  readonly #copilotService = inject(CopilotService)
  readonly #copilotEngine = inject(NgmCopilotEngineService)
  readonly #dsCoreService = inject(NgmDSCoreService)
  readonly #wasmAgent = inject(WasmAgentService)
  readonly #translate = inject(TranslateService)
  readonly #logger = inject(NGXLogger)

  readonly language = toSignal(this.#translate.onLangChange.pipe(map(({ lang }) => lang)))

  get model(): NgmSemanticModel {
    return this.#model()
  }
  set model(value) {
    this.#model.set(value)
  }
  readonly #model = signal<NgmSemanticModel>(null)
  private model$ = toObservable(this.#model)

  readonly dataSourceName = computed(() => getSemanticModelKey(this.#model()))

  // cube: Cube
  readonly cube$ = signal<Cube>(null)

  readonly _suggestedPrompts = signal<Record<string, string[]>>({})

  readonly suggestedPrompts = computed(() => {
    return this._suggestedPrompts()[this.dataSourceName() + (this.cube$()?.name ?? '')]
  })
  readonly suggesting = signal(false)
  // readonly classification = signal<string | null>(null)
  // readonly _entityType = computedAsync(() => this.getEntityType(classification))

  readonly entityType = toSignal(
    combineLatest([toObservable(this.dataSourceName),
      toObservable(this.cube$).pipe(map((cube) => cube?.name))
    ]).pipe(
      debounceTime(100),
      filter(([key, cube]) => !!key && !!cube),
      switchMap(([key, cube]) =>
        this.#dsCoreService.selectEntitySet(key, cube).pipe(map((entitySet) => entitySet?.entityType))
      )
    )
  )

  readonly allCubes = computedAsync(() => {
    const dataSourceName = this.dataSourceName()

    return this.#dsCoreService
      .getDataSource(dataSourceName)
      .pipe(switchMap((dataSource) => (this.#model()?.schema?.cubes?.length ? dataSource.discoverMDCubes() : of([]))))
  })

  error = ''
  answers = []

  demoModelCubes = DemoModelCubes

  entityPromptLimit = 10
  get copilotEnabled() {
    return this.#copilotService.enabled
  }
  readonly models$ = this.#modelsService.getMy()
  readonly hasCube$ = toSignal(this.model$.pipe(map((model) => !!model?.schema?.cubes?.length)))

  readonly cubes$ = toObservable(this.dataSourceName).pipe(
    filter(nonNullable),
    switchMap((name) => this.#dsCoreService.getDataSource(name)),
    switchMap((dataSource) => dataSource.discoverMDCubes())
  )

  async setModel(model: NgmSemanticModel) {
    this.error = null
    model = convertNewSemanticModelResult(
      await firstValueFrom(
        this.#modelsService.getById(model.id, ['indicators', 'createdBy', 'updatedBy', 'dataSource', 'dataSource.type'])
      )
    )
    this.model = model
    if (!this._suggestedPrompts()[this.dataSourceName()]) {
      this.registerModel(model)
      const answer = await this.suggestPrompts()
      this._suggestedPrompts.set({ ...this._suggestedPrompts(), [this.dataSourceName()]: answer.suggests })
    }
  }

  async setCube(cube: Cube) {
    this.error = null
    this.cube$.set(cube)
    if (cube) {
      const answer = await this.suggestPrompts()
      this._suggestedPrompts.set({
        ...this._suggestedPrompts(),
        [this.dataSourceName() + this.cube$().name]: answer.suggests
      })
    }
  }

  private registerModel(model: NgmSemanticModel) {
    registerModel(model, this.#dsCoreService, this.#wasmAgent)
  }

  async preclassify(prompt: string, options?: { abortController: AbortController; conversationId: string }) {
    const choices = await this.#copilotService.createChat(
      [
        {
          id: nanoid(),
          role: CopilotChatMessageRoleEnum.System,
          content: `请根据多维模型列表给出问题涉及到的 only one model name in json format
例如
多维模型列表： "sales_fact" 销售, "product" 产品, "warehouse" 仓库
问题：按产品类别统计销售额
回答： "sales_fact"`
        },
        {
          id: nanoid(),
          role: CopilotChatMessageRoleEnum.User,
          content: `多维模型列表： ${await this.getAllEntities()}
问题：${prompt}
回答： `
        }
      ],
      {
        ...(options ?? {}),
        request: {
          temperature: 0.2
        }
      }
    )

    try {
      const answer = JSON5.parse(choices[0].message.content)
      return answer
    } catch (err) {
      throw new Error(`Error parse: ${choices[0].message.content}`)
    }
  }

  async askCopilot(prompt: string, options?: { abortController: AbortController; conversationId: string }) {
    try {
      // const classification =
      //   this.hasCube$() && this.cube$() ? this.cube$().name : await this.preclassify(prompt, options)
      // this.classification.set(classification)

      // const entityType = await this.getEntityType(classification)

      await this.#copilotEngine.chat(`/chart ${prompt}`, {
        newConversation: true,
        abortController: options?.abortController,
        assistantMessageId: options.conversationId,
        conversationId: options.conversationId
      })
    } catch (err) {
      this.#logger.error(err)
    }
  }

  /**
   * Suggest AI prompts for the cube or random 10 cubes related to the entity type info of the cube
   *
   * @param cube
   * @returns
   */
  async suggestPrompts(cube?: Cube) {
    this.suggesting.set(true)
    try {
      let prompt = ''
      // Specify the Cube or 10 random Cubes or Tables information
      if (cube) {
        prompt = calcEntityTypePrompt(await this.getEntityType(cube.name))
      } else {
        prompt = await this.getRandomEntityTypes(10)
      }
      const choices = await this.#copilotService.createChat(
        [
          {
            id: nanoid(),
            role: CopilotChatMessageRoleEnum.System,
            content: `假设你是一名 BI 专家，请根据多维数据模型信息给出用户应该提问的 10 个问题(use language: ${this.language()}) in json format，不用解释。
  例如：
  多维数据模型信息为：${JSON.stringify(this.demoModelCubes)}
  回答：${JSON.stringify(
    this.#translate.instant('PAC.Home.Insight.PromptExamplesForVisit', {
      Default: [
        'the trend of visit, line is smooth and width 5',
        'visits by product category, show legend',
        'visit trend of some product in 2023 year'
      ]
    })
  )}`
          },
          {
            id: nanoid(),
            role: CopilotChatMessageRoleEnum.User,
            content: `多维数据模型信息为：${prompt}\n回答：`
          }
        ],
        {
          request: {
            model: 'gpt-3.5-turbo-0613',
            functions: [
              {
                name: 'create_suggests',
                description: 'Should always be used to properly format output',
                parameters: zodToJsonSchema(SuggestsSchema)
              }
            ],
            function_call: { name: 'create_suggests' }
          }
        }
      )

      const answer = getFunctionCall(choices[0].message)
      return answer.arguments
    } catch (err: any) {
      this.error = err.message
      return []
    } finally {
      this.suggesting.set(false)
    }
  }

  getCubesPromptInfo(entityTypes: EntityType[]) {
    return entityTypes.map((cube) => calcEntityTypePrompt(cube))
  }

  /**
   * 获取数据源的实体信息，多维数据集或者源表结构
   */
  async getRandomEntityTypes(total: number) {
    const dataSourceName = this.dataSourceName()
    const dataSource = await firstValueFrom(this.#dsCoreService.getDataSource(dataSourceName))
    if (this.model.schema?.cubes?.length) {
      const cubes = await firstValueFrom(dataSource.discoverMDCubes())
      const randomCubes = []
      //loop 10 times to select 10 items
      for (let i = 0; i < Math.min(cubes.length, total); i++) {
        let randomIndex = Math.floor(Math.random() * cubes.length) //generate random index
        let selectedItem = cubes[randomIndex] //get the randomly selected item
        randomCubes.push(selectedItem) //add the item to the array of random items
        cubes.splice(randomIndex, 1) //remove the selected item from the original array to prevent duplicates
      }

      const entityTypes = await firstValueFrom(
        combineLatest<Array<EntityType | Error>>(randomCubes.map((cube) => dataSource.selectEntityType(cube.name)))
      )
      return JSON.stringify(this.getCubesPromptInfo(entityTypes.filter(isEntityType)))
    } else {
      const tables = await firstValueFrom(dataSource.discoverDBTables())
      const randomTables = []
      //loop 10 times to select 10 items
      for (let i = 0; i < Math.min(tables.length, total); i++) {
        let randomIndex = Math.floor(Math.random() * tables.length) //generate random index
        let selectedItem = tables[randomIndex] //get the randomly selected item
        randomTables.push(selectedItem) //add the item to the array of random items
        tables.splice(randomIndex, 1) //remove the selected item from the original array to prevent duplicates
      }

      const entityTypes = await firstValueFrom(
        combineLatest<Array<EntityType | Error>>(randomTables.map((table) => dataSource.selectEntityType(table.name)))
      )

      return entityTypes
        .filter(isEntityType)
        .map(
          (entityType) =>
            `Table: ${entityType.name} caption: ${entityType.caption} columns: (${Object.keys(entityType.properties)
              .map(
                (name) =>
                  `${name} ${entityType.properties[name].dataType ?? ''} ${entityType.properties[name].caption ?? ''}`
              )
              .join(', ')})`
        )
        .join(', ')
    }
  }

  async getAllEntities() {
    const dataSourceName = this.dataSourceName()
    const dataSource = await firstValueFrom(this.#dsCoreService.getDataSource(dataSourceName))

    const entities = []
    if (this.model.schema?.cubes?.length) {
      const cubes = await firstValueFrom(dataSource.discoverMDCubes())
      entities.push(cubes.map((cube) => `"${cube.name}" ${cube.caption ?? ''}`))
    } else {
      const tables = await firstValueFrom(dataSource.discoverDBTables())
      entities.push(tables.map((item) => `"${item.name}" ${item.caption ?? ''}`))
    }

    return uniq(entities).join(', ')
  }

  /**
   * Get entity type by name
   *
   * @param name Entity name
   * @returns EntityType
   */
  async getEntityType(name: string) {
    const dataSourceName = this.dataSourceName()
    const dataSource = await firstValueFrom(this.#dsCoreService.getDataSource(dataSourceName))
    const entityType = await firstValueFrom(dataSource.selectEntityType(name))
    if (isEntityType(entityType)) {
      return entityType
    }

    throw entityType
  }

  //   getChartTypePrompt() {
  //     return `chartType 属性类型定义("type" is required, others is optional)为：
  // ${JSON.stringify([
  //   { type: 'Pie' },
  //   { type: 'Pie', variant: 'Doughnut' },
  //   { type: 'Pie', variant: 'Nightingale' },
  //   { type: 'Bar', orient: 'horizontal', variant: 'polar' },
  //   { type: 'Bar', orient: 'vertical', variant: 'polar' },
  //   { type: 'Bar', orient: 'horizontal' },
  //   { type: 'Bar', orient: 'vertical' },
  //   { type: 'Bar' },
  //   { type: 'Line' },
  //   { type: 'Line', orient: 'horizontal' },
  //   { type: 'Line', orient: 'vertical' },
  //   { type: 'Sankey' },
  //   { type: 'Sankey', orient: 'horizontal' },
  //   { type: 'Sankey', orient: 'vertical' },
  //   { type: 'Treemap' }
  // ])}`
  //   }

  //   getSlicersPrompt() {
  //     return `过滤器使用属性 slicers 类型定义为：
  // {
  //   "dimension": {
  //     "dimension": // required 维度
  //     "hierarchy": // 层次结构
  //     "level": // 层级
  //   },
  //   "members": [
  //     {
  //       "value": // required 成员唯一键
  //       "caption": //成员文本
  //     }
  //   ],
  //   "exclude": true | false // 是否排除 members 中的成员
  // }`
  //   }

  //   getDimensionPrompt() {
  //     return `The json schema for Dimension object is:
  // {
  //   "dimension": // required Dimension name
  //   "hierarchy": // Hierarchy name in the dimension
  //   "level": // level name
  //   "order": "DESC" | "ASC" // optional
  //   "role": "Stacked" | "Group" | "Trellis" // optional
  // }
  //     `
  //   }

  //   getMeasurePrompt() {
  //     return `The json schema for Measure object is:
  // {
  //   "dimension": "Measures", // Constant value for measure
  //   "measure": // required the name of measure
  //   "order": "DESC" | "ASC" // optional
  //   "chartOptions": { // chartOptions is ECharts options (in json format) for the Measure
  //     "seriesStyle": // ECharts series options (in json format) for the Measure
  //     "axis": // ECharts axis options (in json format) for the measure
  //     "dataZoom": // ECharts dataZoom options (in json format) for the measure
  //   }
  // }
  //     `
  //   }

  //   getDataSettingsPrompt() {
  //     return `The json schema for data settings is:
  // {
  //   "dimensions": [
  //     one or more Dimension object array
  //   ],
  //   "measures": [
  //     one or more Measure object array
  //   ],
  //   "limit": // Limit number of results
  // }
  // `
  //   }
}
