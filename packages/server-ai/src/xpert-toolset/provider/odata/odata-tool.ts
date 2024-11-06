import { CallbackManagerForToolRun } from '@langchain/core/callbacks/manager'
import { RunnableConfig } from '@langchain/core/runnables'
import { ToolParams } from '@langchain/core/tools'
import { IXpertTool, XpertToolsetCategoryEnum } from '@metad/contracts'
import { BaseTool } from '../../toolset'
import { ApiBasedToolSchemaParser } from '../../utils/parser'
import { ToolParameterValidationError } from '../../errors'

export type TODataService = any

export class ODataTool extends BaseTool {
	// providerType = XpertToolsetCategoryEnum.API

	constructor(
		protected xpertTool: IXpertTool,
		protected service?: TODataService,
		fields?: ToolParams
	) {
		super(fields)

		this.name = xpertTool.name
		this.description = xpertTool.description

		if (xpertTool.schema) {
			this.schema = ApiBasedToolSchemaParser.parseParametersToZod(xpertTool.schema.parameters ?? [] /* Default empty */) as unknown as typeof this.schema
		}
	}

	async validate_credentials(credentials: Record<string, any>, parameters: Record<string, any>, format_only = false) {
		if (format_only) {
			return ''
		}
	}

	protected async _call(
		toolParameters: any,
		runManager?: CallbackManagerForToolRun,
		parentConfig?: RunnableConfig
	): Promise<any> {
		await this.service.init
		const entitySet = this.service[this.xpertTool.schema.name]
		if (!entitySet) {
			throw new ToolParameterValidationError(`Entity '${this.xpertTool.schema.name}' not found`)
		}
		if (this.xpertTool.schema.method === 'query') {
			return await entitySet.get()
		} else if (this.xpertTool.schema.method === 'get') {
			return await entitySet.get(toolParameters)
		}
		const result = await entitySet.get(toolParameters)
		console.log(result)
		return result
	}
}
