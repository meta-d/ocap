import { ApiToolBundle, IXpertTool, XpertToolsetCategoryEnum } from '@metad/contracts'
import { BaseToolset } from '../toolset'
import { OpenAPITool } from './openapi/openapi-tool'

export class OpenAPIToolset extends BaseToolset<OpenAPITool> {
	provider_id: string

	get providerType(): XpertToolsetCategoryEnum {
		return XpertToolsetCategoryEnum.API
	}

	private _parse_tool_bundle(tool_bundle: ApiToolBundle): OpenAPITool {
		// Todo
		return new OpenAPITool({options: {api_bundle: tool_bundle}} as unknown as IXpertTool, {
			identity: {
				author: tool_bundle.author,
				name: tool_bundle.operation_id,
				label: { en_US: tool_bundle.operation_id, zh_Hans: tool_bundle.operation_id },
				icon: this.identity.icon,
				provider: this.provider_id
			},
			description: {
				human: { en_US: tool_bundle.summary || '', zh_Hans: tool_bundle.summary || '' },
				llm: tool_bundle.summary || ''
			},
			parameters: tool_bundle.parameters || [],
			runtime: null
		})
	}

	load_bundled_tools(tools: ApiToolBundle[]): OpenAPITool[] {
		this.tools = tools.map((tool) => this._parse_tool_bundle(tool))
		return this.tools
	}

	getTools() {
		if (this.tools) {
			return this.tools
		}

		const tools: OpenAPITool[] = []
		this.toolset.tools?.forEach((item) => {
			// console.log(JSON.stringify(item.schema, null, 2));
			tools.push(new OpenAPITool(item, {
				runtime: {
					credentials: this.toolset.credentials
				}
			}))
		})

		this.tools = tools
		return tools
	}

	getTool(tool_name: string): OpenAPITool {
		if (!this.tools) {
			this.getTools()
		}

		for (const tool of this.tools) {
			if (tool.name === tool_name) {
				return tool
			}
		}

		throw new Error(`tool ${tool_name} not found`)
	}
}
