import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { IBasePerTenantAndOrganizationEntityModel } from '../base-entity.model'
import { IUser } from '../user.model'
import { AiProviderRole, ICopilot } from './copilot.model'
import { IXpertRole } from './xpert-role.model'
import { IXpertTool } from './xpert-tool.model'

export type XpertToolsetType = string
export type TXpertToolset = {
  /**
   * toolset name
   */
  name: string
  type?: XpertToolsetType
  description?: string
  /**
   * avatar url
   */
  avatar?: string
  /**
   * Priority role of AI provider
   * @default `AiProviderRole.Secondary`
   */
  providerRole?: AiProviderRole

  options?: Record<string, any>

  tools?: IXpertTool[]
}

/**
 * Toolset for Xpert
 */
export interface IXpertToolset extends IBasePerTenantAndOrganizationEntityModel, TXpertToolset {}

export type XpertToolContext = {
  tenantId: string
  organizationId?: string
  user: IUser
  copilot: ICopilot
  chatModel: unknown // BaseChatModel in langchain
  roleContext: Record<string, any>
  role: IXpertRole
}

export const TOOLSET_TYPES = new Map<string, any>()

TOOLSET_TYPES.set('TavilySearch', {
  name: 'TavilySearch',
  description: 'Tavily Search is a robust search API tailored specifically for LLM Agents.',
  avatar: '/assets/icons/tavily.ico',
  schema: {
    type: 'object',
    properties: {
      apiKey: { type: 'string', title: 'Api Key' },
      maxResults: { type: 'number', title: 'Max results', default: '2' }
    },
    required: ['apiKey'],
    secret: ['apiKey']
  }
})

// 临时
export const TOOLSETS: IXpertToolset[] = [
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
        name: 'ChatBI',
        description: 'ChatBI Command Tool',
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
    name: 'ChatDB',
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
              // dataSourceId: z.string().describe('The id of dataSource'),
              // schema: z.string().describe('The schema in dataSource db'),
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
              // dataSourceId: z.string().describe('The id of dataSource'),
              // schema: z.string().describe('The schema in dataSource db'),
              tables: z.array(z.string()).describe('The tables to query')
            })
          )
        )
      },
      {
        name: 'QuerySql',
        description: 'Execute SQL statement of query',
        type: 'command',
        schema: JSON.stringify(
          zodToJsonSchema(
            z.object({
              query: z.string().describe('The sql statement of query')
            })
          )
        )
      }
    ]
  },
  {
    id: '5',
    name: 'SearchApi',
    description: 'SearchApi for Search',
    avatar: '/assets/icons/search-api.png',
    tools: [
      {
        name: 'SearchApi',
        description: 'SearchApi for Search',
        options: {
          engine: 'google'
        }
      }
    ]
  },
  {
    id: '6',
    name: 'TavilySearch',
    description: 'Tavily Search is a robust search API tailored specifically for LLM Agents.',
    avatar: '/assets/icons/tavily.ico',
    tools: [
      {
        name: 'TavilySearch',
        description: 'Search tool tailored specifically for LLM Agents',
        options: {
          maxResults: 2
        }
      }
    ]
  },
  {
    id: '7',
    name: 'ExaSearch',
    description: 'Exa is a knowledge API for AI and developers.',
    avatar: '/assets/icons/exa-ai.png',
    tools: [
      {
        name: 'ExaSearch',
        description: 'Search tool of Exa',
        options: {
          numResults: 2
        }
      }
    ]
  },
  {
    id: '8',
    name: 'SearxngSearch',
    description:
      'SearXNG is a free internet metasearch engine which aggregates results from various search services and databases. Users are neither tracked nor profiled.',
    avatar: '/assets/icons/searxng.svg',
    tools: [
      {
        name: 'SearxngSearch',
        description:
          'This tool is useful for performing meta-search engine queries using the SearxNG API. It is particularly helpful in answering questions about current events.',
        options: {
          apiBase: 'https://search.inetol.net/',
          engines: 'google'
        }
      }
    ]
  }
]
