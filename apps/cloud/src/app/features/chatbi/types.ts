import { CopilotChatMessage } from '@metad/copilot'
import { DataSettings, ISlicer } from '@metad/ocap-core'

export interface ChatbiConverstion {
  id: number
  name: string
  modelId: string
  dataSource: string
  cube: string
  command: string
  messages: CopilotChatMessage[]
}

export interface QuestionAnswer {
  key: string
  answering: boolean
  chartOptions: any
  dataSettings: DataSettings
  chartSettings: any
  options?: any
  expanded: boolean
  isCube: boolean
  message: string
  slicers: ISlicer[]
  title: string
}
