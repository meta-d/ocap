import { IXpertTool, IXpertToolset, TToolCredentials } from '@metad/contracts'
import { getErrorMessage, omit } from '@metad/server-common'
import { ToolProviderCredentialValidationError } from '../../../errors'
import { BuiltinToolset, TBuiltinToolsetParams } from '../builtin-toolset'
import { ChatDBCommandTool } from './tools/chatdb-command'

export class ChatDBToolset extends BuiltinToolset {
	static provider = 'chatdb'

	constructor(
		protected toolset: IXpertToolset,
		params: TBuiltinToolsetParams,
	) {
		super(ChatDBToolset.provider, toolset, params)

		if (toolset) {
			this.tools = toolset.tools
				.filter((tool) => tool.enabled)
				.map((tool) => {
					// Provide specific tool name to tool class
					const DynamicCommandTool = class extends ChatDBCommandTool {
						static lc_name(): string {
							return tool.name
						}
						constructor(tool: IXpertTool, toolset: BuiltinToolset) {
							super(tool, toolset)
						}
					}

					return new DynamicCommandTool({...tool, toolset: omit(toolset, 'tools')}, this)
				})
		}
	}

	async _validateCredentials(credentials: TToolCredentials) {
		try {
			const dataSources = credentials.dataSources
			const schema = credentials.schema
			await this.params.toolsetService.executeCommand('PingDataSource', {
				dataSource: dataSources[0],
				schema: schema?.[0]
			})
		} catch (e) {
			throw new ToolProviderCredentialValidationError(getErrorMessage(e))
		}
	}
}
