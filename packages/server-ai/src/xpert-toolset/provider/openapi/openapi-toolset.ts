import { ApiToolBundle, IXpertTool, XpertToolsetCategoryEnum } from '@metad/contracts'
import { BaseToolset } from '../../toolset'
import { OpenAPITool } from './tools/openapi-tool'

export class OpenAPIToolset extends BaseToolset<OpenAPITool> {

	providerType = XpertToolsetCategoryEnum.API

	provider_id: string

	// private _parse_tool_bundle(tool_bundle: ApiToolBundle): OpenAPITool {
	// 	// Todo
	// 	return new OpenAPITool({options: {api_bundle: tool_bundle}} as unknown as IXpertTool, {
	// 		identity: {
	// 			author: tool_bundle.author,
	// 			name: tool_bundle.operation_id,
	// 			label: { en_US: tool_bundle.operation_id, zh_Hans: tool_bundle.operation_id },
	// 			icon: this.identity.icon,
	// 			provider: this.provider_id
	// 		},
	// 		description: {
	// 			human: { en_US: tool_bundle.summary || '', zh_Hans: tool_bundle.summary || '' },
	// 			llm: tool_bundle.summary || ''
	// 		},
	// 		parameters: tool_bundle.parameters || [],
	// 		runtime: null
	// 	})
	// }

	// load_bundled_tools(tools: ApiToolBundle[]): OpenAPITool[] {
	// 	this.tools = tools.map((tool) => this._parse_tool_bundle(tool))
	// 	return this.tools
	// }

	getTools() {
		if (this.tools) {
			return this.tools
		}

		const tools: OpenAPITool[] = []
		this.toolset.tools?.filter((_) => _.enabled).forEach((item) => {
			const tool = new OpenAPITool({
				...item,
				toolset: this.toolset
			})
			// Provide specific tool name to tool class
			;(<typeof OpenAPITool>tool.constructor).lc_name = function() {
				return item.name;
			}
		
			tools.push(tool)
		})

		this.tools = tools
		return tools
	}

	getTool(toolName: string): OpenAPITool {
		if (!this.tools) {
			this.getTools()
		}

		for (const tool of this.tools) {
			if (tool.name === toolName) {
				return tool
			}
		}

		throw new Error(`tool ${toolName} not found`)
	}
}
