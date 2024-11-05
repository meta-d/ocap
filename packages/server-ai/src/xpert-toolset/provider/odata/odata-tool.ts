import { CallbackManagerForToolRun } from '@langchain/core/callbacks/manager'
import { RunnableConfig } from '@langchain/core/runnables'
import { ToolParams } from '@langchain/core/tools'
import { IXpertTool, XpertToolsetCategoryEnum } from '@metad/contracts'
import { Service } from '@sap_oss/odata-library'
import { BaseTool, IBaseTool } from '../../toolset'

export class ODataTool extends BaseTool {
	providerType = XpertToolsetCategoryEnum.API

	constructor(
		protected xpertTool: IXpertTool,
		protected base?: IBaseTool,
		fields?: ToolParams
	) {
		super(base, fields)

		this.name = xpertTool.name
		this.description = xpertTool.description
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
		const service: any = new Service('https://username:password@localhost/path/to/service/')
		const _init = await service.init
		const result = await service.Entity_Set_Name.get(1)
		console.log(result)
		return result
	}
}
