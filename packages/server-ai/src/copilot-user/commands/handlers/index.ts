import { CopilotCheckLimitHandler } from './check-limit.handler'
import { CopilotTokenRecordHandler } from './token-record.handler'

export const CommandHandlers = [CopilotTokenRecordHandler, CopilotCheckLimitHandler]
