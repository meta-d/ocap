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
  category?: 'command' | string | null
  description?: string
  /**
   * avatar url
   */
  avatar?: string
  /**
   * Priority role of AI provider
   * @default `AiProviderRole.Secondary`
   */
  aiProviderRole?: AiProviderRole

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

export const TOOLSET_TYPES = new Map<string, IXpertToolset & { schema?: any }>()

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

TOOLSET_TYPES.set('DuckDuckGo', {
  name: 'DuckDuckGo',
  description: 'DuckDuckGo Search.',
  avatar: '/assets/icons/duckduckgo-icon.webp',
  schema: {
    type: 'object',
    properties: {
      maxResults: { type: 'number', title: 'Max results', default: '2' },
      searchOptions: {
        type: 'object',
        properties: {
          safeSearch: { type: 'number', title: 'SafeSearch Level', default: '0' },
          locale: { type: 'string', title: 'Locale' },
        }
      }
    },
    required: [],
    secret: []
  }
})

TOOLSET_TYPES.set('Wikipedia', {
  name: 'Wikipedia',
  description: 'Wikipedia Query.',
  avatar: '/assets/icons/wikipedia-icon.png',
})

TOOLSET_TYPES.set('ChatDB', {
  name: 'ChatDB',
  description: 'ChatDB Tools.',
  category: 'command',
  avatar: '/assets/images/chatbi.jpg',
  aiProviderRole: AiProviderRole.Primary,
  schema: {
    type: 'object',
    properties: {
      dataSourceId: { type: 'string', title: 'DataSource Id' },
      schema: { type: 'string', title: 'Schema' },
    },
    required: [],
    secret: []
  },
  tools: [
    {
      name: 'ListTables',
      description: 'List tables',
      schema: 
        zodToJsonSchema(
          z.object({
            // dataSourceId: z.string().describe('The id of dataSource'),
            // schema: z.string().describe('The schema in dataSource db'),
          })
        )
    },
    {
      name: 'QuerySchema',
      description: 'Query schema for tables',
      schema: 
        zodToJsonSchema(
          z.object({
            // dataSourceId: z.string().describe('The id of dataSource'),
            // schema: z.string().describe('The schema in dataSource db'),
            tables: z.array(z.string()).describe('The tables to query')
          })
        )
    },
    {
      name: 'QuerySql',
      description: 'Execute SQL statement of query',
      schema: 
        zodToJsonSchema(
          z.object({
            query: z.string().describe('The sql statement of query')
          })
        )
    }
  ]
})

TOOLSET_TYPES.set('ChatBI', {
  name: 'ChatBI',
  description: 'Chat with BI.',
  category: 'command',
  avatar: '/assets/images/chatbi.jpg',
  aiProviderRole: AiProviderRole.Primary,
  schema: {
    type: 'object',
    properties: {
    },
    required: [],
    secret: []
  },
  tools: [
    {
      name: 'ChatBI',
      description: 'ChatBI Command Tool',
      schema:
        zodToJsonSchema(
          z.object({
            question: z.string().describe('The question to ask bi tool')
          })
        )
    }
  ]
})


// 临时
export const TOOLSETS: IXpertToolset[] = [
  // {
  //   id: '1',
  //   name: 'DuckDuckGo',
  //   description: 'DuckDuckGo Search',
  //   avatar: '/assets/icons/duckduckgo-icon.webp',
  //   tools: [
  //     {
  //       name: 'DuckDuckGoSearch',
  //       description: 'DuckDuckGo Search'
  //     }
  //   ]
  // },
  // {
  //   id: '2',
  //   name: 'Wikipedia',
  //   description: 'Wikipedia Query',
  //   avatar: '/assets/icons/wikipedia-icon.png',
  //   tools: [
  //     {
  //       name: 'WikipediaQuery',
  //       description: 'Wikipedia Query Tool'
  //     }
  //   ]
  // },
  // {
  //   id: '3',
  //   name: 'ChatBI',
  //   description: 'Chat with BI',
  //   avatar: '/assets/images/chatbi.jpg',
  //   aiProviderRole: AiProviderRole.Primary,
  //   tools: [
  //     {
  //       name: 'ChatBI',
  //       description: 'ChatBI Command Tool',
  //       type: 'command',
  //       schema: 
  //         zodToJsonSchema(
  //           z.object({
  //             question: z.string().describe('The question to ask bi tool')
  //           })
  //         )
  //     }
  //   ]
  // },
  // {
  //   id: '4',
  //   name: 'ChatDB',
  //   description: 'Chat with SQL DB',
  //   avatar: '/assets/images/chatbi.jpg',
  //   aiProviderRole: AiProviderRole.Primary,
  //   tools: [
  //     {
  //       name: 'ListTables',
  //       description: 'List tables',
  //       type: 'command',
  //       schema: 
  //         zodToJsonSchema(
  //           z.object({
  //             // dataSourceId: z.string().describe('The id of dataSource'),
  //             // schema: z.string().describe('The schema in dataSource db'),
  //           })
  //         )
  //     },
  //     {
  //       name: 'QuerySchema',
  //       description: 'Query schema for tables',
  //       type: 'command',
  //       schema: 
  //         zodToJsonSchema(
  //           z.object({
  //             // dataSourceId: z.string().describe('The id of dataSource'),
  //             // schema: z.string().describe('The schema in dataSource db'),
  //             tables: z.array(z.string()).describe('The tables to query')
  //           })
  //         )
  //     },
  //     {
  //       name: 'QuerySql',
  //       description: 'Execute SQL statement of query',
  //       type: 'command',
  //       schema: 
  //         zodToJsonSchema(
  //           z.object({
  //             query: z.string().describe('The sql statement of query')
  //           })
  //         )
  //     }
  //   ]
  // },
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
  // {
  //   id: '6',
  //   name: 'TavilySearch',
  //   description: 'Tavily Search is a robust search API tailored specifically for LLM Agents.',
  //   avatar: '/assets/icons/tavily.ico',
  //   tools: [
  //     {
  //       name: 'TavilySearch',
  //       description: 'Search tool tailored specifically for LLM Agents',
  //       options: {
  //         maxResults: 2
  //       }
  //     }
  //   ]
  // },
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
