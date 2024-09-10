import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { IBasePerTenantEntityModel } from '../base-entity.model'
import { IUser } from '../user.model'
import { AiProviderRole, ICopilot } from './copilot.model'

/**
 * Toolset in copilot
 */
export interface ICopilotToolset extends IBasePerTenantEntityModel {
  /**
   * tool name
   */
  name: string
  description: string
  /**
   * avatar url
   */
  avatar?: string
  /**
   * Priority role of AI provider
   * @default `AiProviderRole.Secondary`
   */
  providerRole?: AiProviderRole

  options?: {
    token: string
  }

  tools: ICopilotTool[]
}

export type ICopilotTool = {
  name: string
  description: string
  type?: 'command' | 'agent' | 'browser' | null
  schema?: string

  /**
   * Priority role of AI provider
   * @default `AiProviderRole.Secondary`
   */
  providerRole?: AiProviderRole
}

export type CopilotToolContext = {
  tenantId: string
	organizationId?: string
  user: IUser
  copilot: ICopilot
  chatModel: unknown // BaseChatModel in langchain
}

// 临时
export const TOOLSETS: ICopilotToolset[] = [
  {
    id: '1',
    name: 'DuckDuckGo',
    description: 'DuckDuckGo Search',
    avatar: '/assets/icons/duckduckgo-icon.webp',
    tools: [
      {
        name: 'DuckDuckGoSearch',
        description: 'DuckDuckGo Search'
      }
    ]
  },
  {
    id: '2',
    name: 'Wikipedia',
    description: 'Wikipedia Query',
    avatar: '/assets/icons/wikipedia-icon.png',
    tools: [
      {
        name: 'WikipediaQuery',
        description: 'Wikipedia Query Tool'
      }
    ]
  },
  {
    id: '3',
    name: 'ChatBI',
    description: 'Chat with BI',
    avatar: '/assets/images/chatbi.jpg',
    providerRole: AiProviderRole.Primary,
    tools: [
      {
        name: 'ChatBINewCommand',
        description: 'ChatBI New Command Tool',
        type: 'command',
        schema: JSON.stringify(
          zodToJsonSchema(
            z.object({
              question: z.string().describe('The question to ask bi tool')
            })
          )
        )
      }
    ]
  },
  {
    id: '4',
    name: 'ChatSQL',
    description: 'Chat with SQL DB',
    avatar: '/assets/images/chatbi.jpg',
    providerRole: AiProviderRole.Primary,
    tools: [
      {
        name: 'ListTables',
        description: 'List tables',
        type: 'command',
        schema: JSON.stringify(
          zodToJsonSchema(
            z.object({
              dataSourceId: z.string().describe('The id of dataSource'),
              schema: z.string().describe('The schema in dataSource db'),
            })
          )
        )
      },
      {
        name: 'QuerySchema',
        description: 'Query schema for tables',
        type: 'command',
        schema: JSON.stringify(
          zodToJsonSchema(
            z.object({
              dataSourceId: z.string().describe('The id of dataSource'),
              schema: z.string().describe('The schema in dataSource db'),
              tables: z.array(z.string()).describe('The tables to query')
            })
          )
        )
      }
    ]
  }
]
