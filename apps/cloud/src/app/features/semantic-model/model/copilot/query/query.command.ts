import { Signal, WritableSignal, computed, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { CopilotAgentType } from '@metad/copilot'
import {
  PROMPT_RETRIEVE_DIMENSION_MEMBER,
  createAgentStepsInstructions,
  injectDimensionMemberRetrieverTool,
  makeCubeRulesPrompt,
  markdownEntityType
} from '@metad/core'
import { NgmCopilotService, createAgentPromptTemplate, injectCopilotCommand } from '@metad/copilot-angular'
import { getErrorMessage } from '@metad/ocap-angular/core'
import { EntityType } from '@metad/ocap-core'
import { serializeName } from '@metad/ocap-sql'
import { TranslateService } from '@ngx-translate/core'
import { injectAgentFewShotTemplate } from 'apps/cloud/src/app/@core/copilot'
import { NGXLogger } from 'ngx-logger'
import { z } from 'zod'
import { ModelEntityService } from '../../entity/entity.service'
import { SemanticModelService } from '../../model.service'

export function injectQueryCommand(
  statement: WritableSignal<string>,
  context: Signal<{
    dialect: string
    isMDX: boolean
    entityTypes: EntityType[]
  }>,
  callback: (query: string) => Promise<any>
) {
  const logger = inject(NGXLogger)
  const translate = inject(TranslateService)
  const copilotService = inject(NgmCopilotService)
  const modelService = inject(SemanticModelService)
  const entityService = inject(ModelEntityService, {optional: true})

  let memberRetrieverTool: DynamicStructuredTool = null
  if (entityService) {
    const defaultModel = toSignal(modelService.modelId$)
    const defaultEntity = toSignal(entityService.entityName$)
    memberRetrieverTool = injectDimensionMemberRetrieverTool(defaultModel, defaultEntity)
  }

  const isMDX = computed(() => context().isMDX)
 
  // Table info
  const promptTables = computed(() => {
    const { isMDX, entityTypes } = context()
    return entityTypes?.map((entityType) => {
      return `${isMDX ? 'Cube' : 'Table'} name: "${entityType.name}",
  caption: "${entityType.caption || ''}",
  ${isMDX ? 'dimensions and measures' : 'columns'} : [${Object.keys(entityType.properties)
    .map(
      (key) =>
        `${serializeName(key, entityType.dialect)} ${entityType.properties[key].dataType}` +
        (entityType.properties[key].caption ? ` ${entityType.properties[key].caption}` : '')
    )
    .join(', ')}]`
    })
  })
  const promptCubes = computed(() => {
    const { entityTypes } = context()
    return entityTypes?.map((entityType) => {
      return `- Cube [${entityType.name}]
  ${markdownEntityType(entityType)}
`
    })
  })
  const dbTablesPrompt = computed(() => {
    const { isMDX, entityTypes } = context()
    const _promptTables = promptTables()
    const _promptCubes = promptCubes()

    return isMDX
      ? `The source dialect is '${entityTypes[0]?.dialect}', the cubes information are \n${_promptCubes?.join('\n\n')}`
      : `The database dialect is '${entityTypes[0]?.dialect}', the tables information are \n${_promptTables?.join('\n\n')}`
  })

  const createQueryTool = new DynamicStructuredTool({
    name: 'createQuery',
    description: `Create or edit query statement. query extracting info to answer the user's question.
statement should be written using this database schema.
The query should be returned in plain text, not in JSON.`,
    schema: z.object({
      query: z.string().min(10)
    }),
    func: async ({ query }) => {
      logger.debug(`Execute copilot action 'createQuery':`, query)
      statement.set(query)
      try {
        const result = await callback(query)
        if (result.error) {
          return `Error: ${result.error}`
        }
        return `Query statement is:
\`\`\`sql
${query}
\`\`\`

And the total number of rows returned is ${result.data.length}.`
      } catch (error) {
        return `Error: ${getErrorMessage(error)}`
      }
    }
  })

  const commandName = 'query'
  return injectCopilotCommand(commandName, {
    alias: 'q',
    description: translate.instant('PAC.MODEL.Copilot.Examples.QueryDBDesc', {
      Default: 'Describe the data you want to query'
    }),
    agent: {
      type: CopilotAgentType.Default
    },
    tools: memberRetrieverTool ? [memberRetrieverTool, createQueryTool] : [createQueryTool],
    fewShotPrompt: injectAgentFewShotTemplate(commandName),
    prompt: createAgentPromptTemplate(`You are a cube modeling expert. Let's create a query statement to query data!
${isMDX() ? createAgentStepsInstructions(
  PROMPT_RETRIEVE_DIMENSION_MEMBER,
  `根据用户输入的逻辑和获取到的维度成员信息创建一个 MDX 查询语句。`,
  `最终调用 "createQuery" 工具来执行查询语句。`,
  `得到查询结果后如果有错误则重新修正查询语句，直到得到正确的查询结果。`
) : ''}

{context}

{system_prompt}`),
    systemPrompt: async () => {
      const { dialect, isMDX, entityTypes } = context()

      let prompt = `${copilotService.rolePrompt()}`

      prompt += isMDX
        ? `Assuming you are an expert in MDX programming, provide a prompt if the system does not offer information on the cubes.
${makeCubeRulesPrompt()}

The cube information is:

${dbTablesPrompt()}

Please provide the corresponding MDX statement for the given question.
${
  statement()
    ? `Current statement: 
\`\`\`mdx
${statement()}
\`\`\`
`
    : ''
}
`
        : `Assuming you are an expert in SQL programming, provide a prompt if the system does not offer information on the database tables.
The table information is:

${dbTablesPrompt()}

Please provide the corresponding SQL statement for the given question.
Note: Table fields are case-sensitive and should be enclosed in double quotation marks.

${statement() ? `Current statement:
\`\`\`sql
${statement()}
\`\`\`
` : ''
}
`
      return prompt
    }
  })
}
