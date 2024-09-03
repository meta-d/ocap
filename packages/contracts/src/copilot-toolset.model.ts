import { IBasePerTenantEntityModel } from './base-entity.model'

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
  }
]