import { CancelChatHandler } from './cancel-chat.handler'
import { ChatWSCommandHandler } from './chat-ws.handler'
import { ChatCommandHandler } from './chat.handler'

export const CommandHandlers = [ChatCommandHandler, CancelChatHandler, ChatWSCommandHandler]
