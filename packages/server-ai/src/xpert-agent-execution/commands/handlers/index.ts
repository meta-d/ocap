import { XpertAgentExecutionOneHandler } from './get-one.handler'
import { XpertAgentExecutionUpsertHandler } from './upsert.handler'

export const CommandHandlers = [XpertAgentExecutionUpsertHandler, XpertAgentExecutionOneHandler]
