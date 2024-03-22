import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { TemplateRef } from '@angular/core'
import { CopilotChatMessage, CopilotEngine } from '@metad/copilot'

export type IUser = {
  name?: string
  imageUrl?: string
}

export interface DropAction {
  id: string
  implementation: (event: CdkDragDrop<any[], any[], any>, copilotEngine: CopilotEngine) => Promise<CopilotChatMessage>
  templateRef?: TemplateRef<unknown>
}

export interface NgmCopilotChatMessage extends CopilotChatMessage {
  templateRef?: TemplateRef<unknown>
}
