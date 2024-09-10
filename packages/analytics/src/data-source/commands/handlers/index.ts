import { ListTablesHandler } from './list-tables.handler'
import { DataLoadHandler } from './load.handler'
import { QuerySchemaHandler } from './query-schema.handler'

export const CommandHandlers = [DataLoadHandler, ListTablesHandler, QuerySchemaHandler]
