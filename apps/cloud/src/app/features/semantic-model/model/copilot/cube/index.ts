import { CopilotCommand } from '@metad/copilot'
import { injectCopilotCommand } from '@metad/ocap-angular/copilot'
import { switchMap } from 'rxjs'
import { ModelCopilotChatConversation, ModelCopilotCommandArea } from '../types'
import { chatCube, createCube } from './chat'

export * from './schema'
