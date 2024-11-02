import { IUser } from '../user.model'
import { I18nObject } from './ai-model.model'
import { AiProviderRole, ICopilot } from './copilot.model'
import { TAvatar } from './types'
import { IXpertTool, XpertToolType } from './xpert-tool.model'
import { IXpert } from './xpert.model'
import { IBasePerWorkspaceEntityModel } from './xpert-workspace.model'
import { ITag } from '../tag-entity.model'


export enum XpertToolsetCategoryEnum {
  BUILTIN = 'builtin',
  API = 'api',
  WORKFLOW = 'workflow'
}

export type XpertToolsetType = string
export type TXpertToolset = {
  /**
   * toolset name
   */
  name: string
  type?: XpertToolsetType
  category?: 'command' | XpertToolsetCategoryEnum
  description?: string
  /**
   * avatar object
   */
  avatar?: TAvatar
  /**
   * Priority role of AI provider
   * @default `AiProviderRole.Secondary`
   */
  aiProviderRole?: AiProviderRole

  /**
   * Privacy policy of this toolset
   */
  privacyPolicy?: string
  /**
   * Custom disclaimer for the toolset
   */
  customDisclaimer?: string

  options?: Record<string, any>
  credentials?: TToolCredentials
  schema?: string
  schemaType?: 'openapi_json' | 'openapi_yaml'

  tools?: IXpertTool[]

  tags?: ITag[]
}

/**
 * Toolset for Xpert
 */
export interface IXpertToolset extends IBasePerWorkspaceEntityModel, TXpertToolset {}

export type XpertToolContext = {
  tenantId: string
  organizationId?: string
  user: IUser
  copilot: ICopilot
  chatModel: unknown // BaseChatModel in langchain
  roleContext: Record<string, any>
  xpert: IXpert
}

export const TOOLSET_TYPES = new Map<string, IXpertToolset & { schema?: any }>()

// TOOLSET_TYPES.set('TavilySearch', {
//   name: 'TavilySearch',
//   description: 'Tavily Search is a robust search API tailored specifically for LLM Agents.',
//   avatar: { url: '/assets/icons/tavily.ico' },
//   schema: {
//     type: 'object',
//     properties: {
//       apiKey: { type: 'string', title: 'Api Key' },
//       maxResults: { type: 'number', title: 'Max results', default: '2' }
//     },
//     required: ['apiKey'],
//     secret: ['apiKey']
//   }
// })

// TOOLSET_TYPES.set('DuckDuckGo', {
//   name: 'DuckDuckGo',
//   description: 'DuckDuckGo Search.',
//   avatar: { url: '/assets/icons/duckduckgo-icon.webp' },
//   schema: {
//     type: 'object',
//     properties: {
//       maxResults: { type: 'number', title: 'Max results', default: '2' },
//       searchOptions: {
//         type: 'object',
//         properties: {
//           safeSearch: { type: 'number', title: 'SafeSearch Level', default: '0' },
//           locale: { type: 'string', title: 'Locale' }
//         }
//       }
//     },
//     required: [],
//     secret: []
//   }
// })

// TOOLSET_TYPES.set('Wikipedia', {
//   name: 'Wikipedia',
//   description: 'Wikipedia Query.',
//   avatar: { url: '/assets/icons/wikipedia-icon.png' }
// })

TOOLSET_TYPES.set('ChatDB', {
  name: 'ChatDB',
  description: 'ChatDB Tools.',
  category: 'command',
  avatar: { url: '/assets/images/chatbi.jpg' },
  aiProviderRole: AiProviderRole.Primary,
  // schema: {
  //   type: 'object',
  //   properties: {
  //     dataSourceId: { type: 'string', title: 'DataSource Id' },
  //     schema: { type: 'string', title: 'Schema' }
  //   },
  //   required: [],
  //   secret: []
  // },
  tools: [
    {
      name: 'ListTables',
      description: 'List tables',
      // schema: zodToJsonSchema(
      //   z.object({
      //     // dataSourceId: z.string().describe('The id of dataSource'),
      //     // schema: z.string().describe('The schema in dataSource db'),
      //   })
      // )
    },
    {
      name: 'QuerySchema',
      description: 'Query schema for tables',
      // schema: zodToJsonSchema(
      //   z.object({
      //     // dataSourceId: z.string().describe('The id of dataSource'),
      //     // schema: z.string().describe('The schema in dataSource db'),
      //     tables: z.array(z.string()).describe('The tables to query')
      //   })
      // )
    },
    {
      name: 'QuerySql',
      description: 'Execute SQL statement of query',
      // schema: zodToJsonSchema(
      //   z.object({
      //     query: z.string().describe('The sql statement of query')
      //   })
      // )
    }
  ]
})

TOOLSET_TYPES.set('ChatBI', {
  name: 'ChatBI',
  description: 'Chat with BI.',
  category: 'command',
  avatar: { url: '/assets/images/chatbi.jpg' },
  aiProviderRole: AiProviderRole.Primary,
  // schema: {
  //   type: 'object',
  //   properties: {},
  //   required: [],
  //   secret: []
  // },
  tools: [
    {
      name: 'ChatBI',
      description: 'ChatBI Command Tool',
      // schema: zodToJsonSchema(
      //   z.object({
      //     question: z.string().describe('The question to ask bi tool')
      //   })
      // )
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
    avatar: { url: '/assets/icons/search-api.png' },
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
    avatar: { url: '/assets/icons/exa-ai.png' },
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
    avatar: { url: '/assets/icons/searxng.svg' },
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

export enum CredentialsType {
  SECRET_INPUT = 'secret-input',
  TEXT_INPUT = 'text-input',
  SELECT = 'select',
  BOOLEAN = 'boolean'
}

interface ToolCredentialsOption {
  value: string
  label: I18nObject | string
}

export interface ToolProviderCredentials {
  name: string
  type: CredentialsType
  required?: boolean
  default?: number | string
  options?: ToolCredentialsOption[]
  label?: I18nObject
  help?: I18nObject
  url?: string
  placeholder?: I18nObject
}

interface ToolParameterOption {
  value: string;
  label: I18nObject;
}

enum ToolParameterType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  SELECT = "select",
  SECRET_INPUT = "secret-input",
  FILE = "file"
}

enum ToolParameterForm {
  SCHEMA = "schema",  // should be set while adding tool
  FORM = "form",      // should be set before invoking tool
  LLM = "llm"         // will be set by LLM
}

export interface ToolParameter {
  name: string;
  label: I18nObject;
  human_description?: I18nObject;
  placeholder?: I18nObject;
  type: ToolParameterType;
  form: ToolParameterForm;
  llm_description?: string;
  required?: boolean;
  default?: number | string;
  min?: number;
  max?: number;
  options?: ToolParameterOption[];
}

export interface ApiToolBundle {
    /**
     * This interface is used to store the schema information of an api based tool,
     * such as the url, the method, the parameters, etc.
     */

    // server_url
    server_url: string;
    // method
    method: string;
    // summary
    summary?: string;
    // operation_id
    operation_id?: string;
    // parameters
    parameters?: ToolParameter[];
    // author
    author: string;
    // icon
    icon?: string;
    // openapi operation
    openapi: Record<string, any>;
}

export enum ApiProviderAuthType {
  /**
   * Enum class for api provider auth type.
   */
  NONE = "none",
  API_KEY = "api_key"
}

export enum ApiProviderSchemaType {
  /**
   * Enum class for api provider schema type.
   */
  OPENAPI = "openapi",
  SWAGGER = "swagger",
  OPENAI_PLUGIN = "openai_plugin",
  OPENAI_ACTIONS = "openai_actions"
}

export enum ToolTagEnum {
	SEARCH = 'search',
	IMAGE = 'image',
	VIDEOS = 'videos',
	WEATHER = 'weather',
	FINANCE = 'finance',
	DESIGN = 'design',
	TRAVEL = 'travel',
	SOCIAL = 'social',
	NEWS = 'news',
	MEDICAL = 'medical',
	PRODUCTIVITY = 'productivity',
	EDUCATION = 'education',
	BUSINESS = 'business',
	ENTERTAINMENT = 'entertainment',
	UTILITIES = 'utilities',
	OTHER = 'other'
}

export interface IToolTag {
	name: string
	label: I18nObject
	icon: string
}

export interface IToolProvider {
  id: string;
  author: string;
  name: string; // identifier
  description: I18nObject;
  /**
   * @deprecated use avatar
   */
  icon?: string;
  avatar: TAvatar
  label: I18nObject; // label
  type: XpertToolsetCategoryEnum;
  masked_credentials?: Record<string, any>
  original_credentials?: Record<string, any>
  is_team_authorization: boolean
  allow_delete: boolean
  tools?: XpertToolType[]
  // labels?: ToolTagEnum[]
  tags: ToolTagEnum[];
}

export type TToolCredentials = Record<string, string | number | boolean>