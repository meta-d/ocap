import { GetODataRemoteMetadataHandler } from './get-odata-remote-metadata.handler'
import { ToolProviderIconHandler } from './get-provider-icon.handler'
import { ListBuiltinCredentialsSchemaHandler } from './list-builtin-credentials-schema.handler'
import { ListBuiltinToolProvidersHandler } from './list-builtin-providers.handler'
import { ListBuiltinToolsHandler } from './list-builtin-tools.handler'
import { FindXpertToolsetsHandler } from './toolset-find.handler'

export const QueryHandlers = [
	FindXpertToolsetsHandler,
	ListBuiltinToolProvidersHandler,
	ToolProviderIconHandler,
	ListBuiltinToolsHandler,
	ListBuiltinCredentialsSchemaHandler,
	GetODataRemoteMetadataHandler
]
