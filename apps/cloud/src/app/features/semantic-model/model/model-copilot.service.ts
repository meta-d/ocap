import { computed, inject, Injectable } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import {
  AIOptions,
  CopilotChatMessage,
  CopilotChatMessageRoleEnum,
  CopilotChatResponseChoice,
  CopilotEngine,
  DefaultModel,
  getFunctionCall
} from '@metad/copilot'
import { Cube, PropertyDimension } from '@metad/ocap-core'
import { TranslateService } from '@ngx-translate/core'
import { NgmCopilotService } from '@metad/core'
import { map, of, switchMap } from 'rxjs'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { SemanticModelService } from './model.service'
import { uuid } from '../../../@core'
import { ModelDimensionState, SemanticModelEntityType } from './types'


type ModelCopilotAction = 'create_dimension' | 'modify_dimension' | 'create_cube' | 'modify_cube' | 'query_cube' | 'free_prompt'


@Injectable()
export class ModelCopilotEngineService implements CopilotEngine {
  private copilotService = inject(NgmCopilotService)
  private readonly translateService = inject(TranslateService)
  private readonly modelService = inject(SemanticModelService)

  private readonly dimensions = toSignal(this.modelService.dimensions$)
  private readonly sharedDimensionsPrompt = computed(() => JSON.stringify(this.dimensions().map((dimension) => ({
    name: dimension.name,
    caption: dimension.caption,
    table: dimension.hierarchies[0].tables[0]?.name,
    primaryKey: dimension.hierarchies[0].primaryKey,
  }))))
  private readonly currentCube = toSignal(this.modelService.currentCube$)
  private readonly currentDimension = toSignal(this.modelService.currentDimension$)

  get name() {
    return this._name()
  }
  private readonly _name = toSignal(this.translateService.stream('PAC.MODEL.MODEL.CopilotName', { Default: 'Modeling' }))

  aiOptions = {
    model: DefaultModel,
    useSystemPrompt: true
  } as AIOptions

  get prompts() {
    return this._prompts()
  }
  private readonly _prompts = toSignal(
    this.translateService.stream('PAC.MODEL.MODEL.CopilotDefaultPrompts', {
      Default: [
        `Create cube by table `,
        `Create dimension by table `,
      ]
    })
  )

  conversations: CopilotChatMessage[] = []

  businessAreas = [
    {
      businessArea: 'Prompt',
      action: 'free_prompt',
      prompts: {
        zhHans: '自由提问'
      },
      language: 'text',
      format: 'text'
    },
    {
      businessArea: 'Dimension',
      action: 'create_dimension',
      prompts: {
        zhHans: '创建维度'
      },
      language: 'dimension',
      format: 'json'
    },
    {
      businessArea: 'Dimension',
      action: 'modify_dimension',
      prompts: {
        zhHans: '修改维度'
      },
    },
    {
      businessArea: 'Cube',
      action: 'create_cube',
      prompts: {
        zhHans: '创建数据集'
      },
      language: 'cube',
      format: 'json'
    },
    {
      businessArea: 'Cube',
      action: 'modify_cube',
      prompts: {
        zhHans: '修改数据集'
      },
      language: 'cube',
      format: 'json'
    },
    {
      businessArea: 'Cube',
      action: 'query_cube',
      prompts: {
        zhHans: '查询数据集'
      },
      language: 'mdx',
    }
  ]

  get systemPrompt() {
    return `预设条件：${JSON.stringify({
      BusinessAreas: this.businessAreas
    })}
根据问题给出涉及到的多个 action 相应 language in format 的答案，value 值使用 object，不用注释，不用额外属性，例如
问题：根据表 product (id string, name string, type string) 信息创建产品维度
答案：
{
  "action": "create_dimension",
  "value": {
    "name": "product",
    "caption": "产品",
    "hierarchies": [
      {
        "name": "",
        "caption": "产品",
        "tables": [
          {
            "name": "product"
          }
        ],
        "levels": [
          {
            "name": "type",
            "column": "type",
            "caption": "类型"
          },
          {
            "name": "name",
            "column": "name",
            "caption": "名称"
          }
        ]
      }
    ]
  }
}
`
  }

  process({prompt, messages}) {
    return of(prompt).pipe(
      switchMap(() => this.preprocess(prompt, this.aiOptions)),
      map((action) => this.assignAction(action, prompt)),
      switchMap(({systemPrompt, options}: any) => {
        return this.copilotService.chatCompletions([
          {
            role: CopilotChatMessageRoleEnum.System,
            content: systemPrompt
          },
          {
            role: CopilotChatMessageRoleEnum.User,
            content: prompt
          }], options)
        .pipe(
          map(({choices}) => choices)
        )
      }),
      switchMap((choices) => this.postprocess(prompt, choices))
    )
  }

  preprocess(prompt: string, options?) {
    return this.copilotService.chatCompletions(
      [
        {
          role: CopilotChatMessageRoleEnum.System,
          content: `预设条件：${JSON.stringify({
            BusinessAreas: this.businessAreas
          })}
根据预设条件将问题划分到相应的 action，value 值使用 object，不用注释，不用额外属性，例如
问题：根据表 product (id string, name string, type string) 信息创建产品维度
答案：
{
  "action": "create_dimension"
}
问题：如何查询 Mysql 数据库中的表信息
答案：
{
  "action": "free_prompt"
}
`
        },
        {
          role: CopilotChatMessageRoleEnum.User,
          content: `请回答
问题：${prompt}
答案：`
        }
      ],
      options
    ).pipe(
      map(({choices}) => {
        let res
        try {
          res = JSON.parse(choices[0].message.content)
          return res.action
        } catch (err) {
          return 'free_prompt'
        }
      })
    )
  }

  postprocess(prompt: string, choices: CopilotChatResponseChoice[]) {
    let res
    try {
      res = getFunctionCall(choices[0].message)
    } catch (err) {
      return of([
        {
          role: CopilotChatMessageRoleEnum.Assistant,
          content: choices[0].message.content
        }
      ])
    }

    if (!Array.isArray(res)) {
      res = [res]
    }

    const messages = []
    res.forEach((operation) => {
      try {
        switch (operation.name) {
          case 'create_dimension':
            this.createDimension(operation.arguments)
            break
          case 'modify_dimension':
            this.modifyDimension(operation.arguments)
            break
          case 'create_cube':
            this.createCube(operation.arguments)
            break
          case 'modify_cube':
            this.modifyCube(operation.arguments)
            break
          case 'query_cube':
            this.queryCube(operation.arguments)
            break
        }

        messages.push({
          role: CopilotChatMessageRoleEnum.Assistant,
          content:
            typeof operation.value === 'string'
              ? operation.value
              : `任务 **${
                  this.businessAreas.find((item) => item.action === operation.name)?.prompts.zhHans
                }** 执行完成`
        })
      } catch (err: any) {
        messages.push({
          role: CopilotChatMessageRoleEnum.Assistant,
          content: '',
          error: err.message
        })
      }
    })

    return of(messages)
  }

  assignAction(action: ModelCopilotAction, prompt: string) {
    if (action === 'create_dimension') {
      return this.createDimensionPrompt(prompt)
    }else if (action === 'modify_dimension') {
      return this.modifyDimensionPrompt(prompt)
    } else if (action === 'create_cube') {
      return this.createCubePrompt(prompt)
    }else if (action === 'modify_cube') {
      return this.modifyCubePrompt(prompt)
    }else if (action === 'query_cube') {
      return this.queryCubePrompt(prompt)
    } else {
      return null
    }
  }

  createDimensionPrompt(prompt: string) {
    return {
      systemPrompt: `The dimension name don't be the same as the table name, It is not necessary to convert all table fields into levels. The levels are arranged in order of granularity from coarse to fine, based on the business data represented by the table fields, for example table: product (id, name, product_category, product_family) to levels: [product_family, product_category, name].`,
      options: {
        model: 'gpt-3.5-turbo-0613',
        functions: [
          {
            name: 'create_dimension',
            description: 'Should always be used to properly format output',
            parameters: zodToJsonSchema(DimensionSchema)
          }
        ],
        function_call: { name: 'create_dimension' }
      }
    }
  }

  modifyDimensionPrompt(prompt: string) {
    return {
      systemPrompt: `根据提示修改 Dimension 信息, The old dimension is: ${JSON.stringify(this.currentDimension())}`,
      options: {
        model: 'gpt-3.5-turbo-0613',
        functions: [
          {
            name: 'modify_dimension',
            description: 'Should always be used to properly format output',
            parameters: zodToJsonSchema(DimensionSchema)
          }
        ],
        function_call: { name: 'modify_dimension' }
      }
    }
  }

  // The cube can join the name of shared dimensions using the source field in dimensionUsages
  createCubePrompt(prompt: string) {
    return {
      systemPrompt: `Generate cube metadata for MDX. The cube name can't be the same as the table name. Partition the table fields that may belong to the same dimension into the levels of hierarchy of the same dimension.
There is no need to create as dimension with those table fields that are already used in dimensionUsages.
The cube can fill the source field in dimensionUsages only within the name of shared dimensions: ${this.sharedDimensionsPrompt()}.
`,
      options: {
        model: 'gpt-3.5-turbo-0613',
        functions: [
          {
            name: 'create_cube',
            description: 'Should always be used to properly format output',
            parameters: zodToJsonSchema(CubeSchema)
          }
        ],
        function_call: { name: 'create_cube' }
      }
    }
  }

  modifyCubePrompt(prompt: string) {
    return {
      systemPrompt: `根据提示修改 Cube 信息`,
      options: {
        model: 'gpt-3.5-turbo-0613',
        functions: [
          {
            name: 'create_cube',
            description: 'Should always be used to properly format output',
            parameters: zodToJsonSchema(CubeSchema)
          }
        ],
        function_call: { name: 'create_cube' }
      }
    }
  }

  queryCubePrompt(prompt: string) {
    return {
      systemPrompt: `根据提示生成查询 Cube 的 MDX statement, Cube structure is: ${JSON.stringify(this.currentCube())}`,
      options: {
        functions: [
          {
            name: 'query_cube',
            description: 'Should always be used to properly format output',
            parameters: zodToJsonSchema(QueryCubeSchema)
          }
        ],
        function_call: { name: 'query_cube' }
      }
    }
  }

  createDimension(dimension: PropertyDimension) {
    console.log(`Created dimension is`, dimension)

    const key = uuid()
    const dimensionState: ModelDimensionState = {
      type: SemanticModelEntityType.DIMENSION,
      id: key,
      name: dimension.name,
      caption: dimension.caption,
      dimension: {
        ...dimension,
        __id__: key,
        hierarchies: dimension.hierarchies?.map((hierarchy) => ({
          ...hierarchy,
          __id__: uuid(),
          levels: hierarchy.levels?.map((level) => ({...level, __id__: uuid()}))
        }))
      },
    }

    this.modelService.newDimension(dimensionState)
    this.modelService.activeEntity(dimensionState)
  }

  modifyDimension(dimension: PropertyDimension) {
    console.log(`Modifyed dimension is`, dimension)
    this.modelService.updateDimension(dimension)
  }

  createCube(cube: Cube) {
    
    console.log(`Created cube is`, cube)

    const key = uuid()
    const cubeState = {
      type: SemanticModelEntityType.CUBE,
      id: key,
      name: cube.name,
      caption: cube.caption,
      cube: {
        ...cube,
        __id__: key,
        measures: cube.measures?.map((measure) => ({...measure, __id__: uuid(), visible: true})),
        dimensions: cube.dimensions?.map((dimension) => ({
          ...dimension,
          __id__: uuid(),
          hierarchies: dimension.hierarchies?.map((hierarchy) => ({
            ...hierarchy,
            __id__: uuid(),
            levels: hierarchy.levels?.map((level) => ({...level, __id__: uuid()}))
          }))
        })),
        dimensionUsages: cube.dimensionUsages?.map((dimensionUsage) => ({...dimensionUsage, __id__: uuid()}))
      },
      sqlLab: {},
    }

    this.modelService.newEntity(cubeState)
    this.modelService.activeEntity(cubeState)
  }

  modifyCube(cube: Cube) {
    console.log(`Modify cube is`, cube)
  }

  queryCube({query}: {query: string}) {
    console.log(`Query cube is`, query)
  }
}

const DimensionSchema = z.object({
  __id__: z.string().optional().describe('The id of the dimension'),
  name: z.string().describe('The name of the dimension'),
  caption: z.string().describe('The caption of the dimension'),
  hierarchies: z
    .array(
      z.object({
        __id__: z.string().optional().describe('The id of the hierarchy'),
        name: z.string().describe('The name of the hierarchy'),
        caption: z.string().describe('The caption of the hierarchy'),
        tables: z.array(z.object({
          name: z.string().describe('The name of the dimension table')
          // join: z.object({})
        })),
        primaryKey: z.string().describe('The primary key of the dimension table'),
        levels: z.array(z.object({
          __id__: z.string().optional().describe('The id of the level'),
          name: z.string().describe('The name of the level'),
          caption: z.string().describe('The caption of the level'),
          column: z.string().describe('The column of the level'),
        }))
        .describe('An array of levels in this hierarchy')
      })
    )
    .describe('An array of hierarchies in this dimension')
})

const CubeSchema = z.object({
  name: z.string().describe('The name of the cube'),
  caption: z.string().describe('The caption of the cube'),
  tables: z.array(z.object({
    name: z.string().describe('The name of the cube fact table')
    // join: z.object({})
  })),
  measures: z.array(z.object({
    name: z.string().describe('The name of the measure'),
    caption: z.string().describe('The caption of the measure'),
    column: z.string().describe('The column of the measure'),
  })).describe('An array of measures in this cube'),
  dimensions: z.array(z.object({
    name: z.string().describe('The name of the dimension'),
    caption: z.string().describe('The caption of the dimension'),
    hierarchies: z.array(z.object({
      name: z.string().describe('The name of the hierarchy'),
      caption: z.string().describe('The caption of the hierarchy'),
      tables: z.array(z.object({
        name: z.string().describe('The name of the dimension table')
        // join: z.object({})
      })),
      primaryKey: z.string().describe('The primary key of the dimension table'),
      hasAll: z.boolean().describe('Whether the hierarchy has an all level'),
      levels: z.array(z.object({
        name: z.string().describe('The name of the level'),
        caption: z.string().describe('The caption of the level'),
        column: z.string().describe('The column of the level'),
      }))
      .describe('An array of levels in this hierarchy')
    }))
    .describe('An array of hierarchies in this dimension')
  }))
  .optional()
  .describe('An array of dimensions in this cube'),

  dimensionUsages: z.array(
    z.object({
      name: z.string().describe('The name of the dimension usage'),
      caption: z.string().optional().describe('The caption of the dimension usage'),
      source: z.string().describe('The name of the shared dimension'),
      foreignKey: z.string().describe('The foreign key of the fact table that join into the shared dimension'),
      description: z.string().optional().describe('The description of the dimension usage'),
    })
  ).optional().describe('An array of shared dimensions used in this cube'),
})

const QueryCubeSchema = z.object({
  query: z.string().describe('The MDX statement of query the cube')
})