import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search'
import { TavilySearchResults } from '@langchain/community/tools/tavily_search'
import { ZodObjectAny } from '@langchain/core/dist/types/zod'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { BaseToolkit, StructuredToolInterface, tool } from '@langchain/core/tools'
import { AiProviderRole, ICopilot, IUser, IXpertToolset, XpertToolContext } from '@metad/contracts'
import { getErrorMessage } from '@metad/server-common'
import { CommandBus } from '@nestjs/cqrs'
import { jsonSchemaToZod } from 'json-schema-to-zod'
import { z } from 'zod'
import { createLLM, ProviderRolePriority } from '../copilot'
import { CopilotTokenRecordCommand } from '../copilot-user'
import { XpertToolsetService } from './xpert-toolset.service'


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

export class DuckDuckGoToolset extends BaseToolset {
	constructor(toolset: IXpertToolset) {
		super(toolset)

		this.tools = [
			new DuckDuckGoSearch({
				maxResults: toolset.options?.maxResults ?? 2,
				searchOptions: toolset.options?.searchOptions
			})
		]
	}
}

export class CommandToolset extends BaseToolset {
	constructor(
		private toolset: IXpertToolset,
		private tenantId: string,
		private organizationId: string,
		private toolsetService: XpertToolsetService,
		private readonly commandBus: CommandBus,
		private readonly user: IUser,
		private readonly copilots: ICopilot[],
        private readonly chatModel: BaseChatModel
	) {
		super(toolset)

		this.tools = this.toolset.tools.map((item) => {
			let zodSchema: z.AnyZodObject = null
			try {
				zodSchema = eval(jsonSchemaToZod(item.schema, { module: 'cjs' }))
			} catch (err) {
				throw new Error(`Invalid input schema for tool: ${item.name}`)
			}
			// Copilot
			let chatModel = this.chatModel
			if (item.aiProviderRole || toolset.aiProviderRole) {
				const copilot = this.findCopilot(item.aiProviderRole || toolset.aiProviderRole)
				chatModel = this.createLLM(copilot)
			}

			// Default args values in copilot role for tool function
			// const defaultArgs = role?.options?.toolsets?.[toolset.id]?.[item.name]?.defaultArgs

			return tool(
				async (args, config) => {
					try {
						return await this.toolsetService.executeCommand(
							item.name,
							{
								...args
							},
							config,
							<XpertToolContext>{
								tenantId: this.tenantId,
								organizationId: this.organizationId,
								user: this.user,
								chatModel,
								// role,
								roleContext: this.toolset.options
							}
						)
					} catch (error) {
						return `Error: ${getErrorMessage(error)}`
					}
				},
				{
					name: item.name,
					description: item.description,
					schema: zodSchema
				}
			)
		})
	}

	findCopilot(role: AiProviderRole) {
		const copilots = this.copilots
		let copilot: ICopilot = null
		for (const priorityRole of ProviderRolePriority.slice(ProviderRolePriority.indexOf(role))) {
			copilot = copilots.find((item) => item.role === priorityRole && item.enabled)
			if (copilot) {
				break
			}
		}

		if (!copilot) {
			throw new Error('copilot not found')
		}
		return copilot
	}

	createLLM(copilot: ICopilot) {
		return createLLM<BaseChatModel>(copilot, {}, async (input) => {
			try {
				await this.commandBus.execute(
					new CopilotTokenRecordCommand({
						...input,
						tenantId: this.tenantId,
						organizationId: this.organizationId,
						userId: this.user.id,
						copilot: copilot
					})
				)
			} catch (err) {
				// if (this.abortController && !this.abortController.signal.aborted) {
				// 	try {
				// 		this.abortController.abort(err.message)
				// 	} catch(err) {
				// 		//
				// 	}
				// }
			}
		})
	}
}

export function createToolset(
	toolset: IXpertToolset,
	context: {
		tenantId: string
		organizationId: string
		toolsetService: XpertToolsetService
		commandBus: CommandBus
		user: IUser
		copilots: ICopilot[]
        chatModel: BaseChatModel
	}
) {
	switch (toolset.type) {
		case 'DuckDuckGo':
			return new DuckDuckGoToolset(toolset)
		case 'TavilySearch':
			return new TavilySearchToolset(toolset)
		default: {
            if (toolset.category === 'command') {
                return new CommandToolset(
                    toolset,
                    context.tenantId,
                    context.organizationId,
                    context.toolsetService,
                    context.commandBus,
                    context.user,
                    context.copilots,
                    context.chatModel,
                )
            }
            return null
        }
	}
}
