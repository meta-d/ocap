import { TavilySearchResults } from '@langchain/community/tools/tavily_search'
import { ZodObjectAny } from '@langchain/core/dist/types/zod'
import { BaseToolkit, StructuredToolInterface } from '@langchain/core/tools'
import { IXpertToolset } from '@metad/contracts'


export class BaseToolset extends BaseToolkit {
	tools: StructuredToolInterface<ZodObjectAny>[]

	constructor(private _toolset: IXpertToolset) {
		super()
	}
}

export class TavilySearchToolset extends BaseToolset {
	constructor(toolset: IXpertToolset) {
		super(toolset)

		this.tools = [
			new TavilySearchResults({
				...toolset.options,
				apiKey: toolset.options.apiKey
			})
		]
	}
}

export function createToolset(toolset: IXpertToolset) {
	switch (toolset.type) {
		case 'TavilySearch':
			return new TavilySearchToolset(toolset)
        default:
            return null
	}
}
