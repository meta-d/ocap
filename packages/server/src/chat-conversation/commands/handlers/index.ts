import { ChatConversationCreateHandler } from './conversation-create.handler'
import { ChatConversationUpdateHandler } from './conversation-update.handler'

export const CommandHandlers = [ChatConversationCreateHandler, ChatConversationUpdateHandler]
