import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { IBasePerTenantEntityModel } from './base-entity.model'
import { IUser } from './user.model'
import { ICopilot } from './copilot.model'

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
}

export type CopilotToolContext = {
  tenantId: string
	organizationId?: string
  user: IUser
  copilot: ICopilot
  chatModel: unknown // BaseChatModel in langchain
}

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
  }
]
