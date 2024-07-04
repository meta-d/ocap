import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { TemplateRef } from '@angular/core'
import { CopilotChatMessage, CopilotEngine } from '@metad/copilot'
import { BaseMessage } from '@langchain/core/messages'

export type IUser = {
  name?: string
  imageUrl?: string
}

export interface DropAction {
  id: string
  implementation: (
    event: CdkDragDrop<any[], any[], any>,
    copilotEngine: CopilotEngine
  ) => Promise<CopilotChatMessage | CopilotChatMessage[]>
  templateRef?: TemplateRef<unknown>
}

export interface NgmCopilotChatMessage extends CopilotChatMessage {
  templateRef?: TemplateRef<unknown>
}

// Types
export interface ISelectOption<T = unknown> {
  key?: string
  /**
   * The value object of the option
   */
  value?: T
  caption?: string
  selected?: boolean
  icon?: string
  fontSet?: string
}

export enum NgmLanguageEnum {
	Chinese = "zh-CN",
	SimplifiedChinese = "zh-Hans",
	TraditionalChinese = 'zh-Hant',
	English = 'en',
}

export interface AgentState {
  input: string
  role: string
  context: string
  messages: BaseMessage[]
}
