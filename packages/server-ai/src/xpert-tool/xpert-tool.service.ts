import { IBuiltinTool, IXpertTool, XpertToolsetCategoryEnum } from '@metad/contracts'
import { omit } from '@metad/server-common'
import { PaginationParams, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, Logger } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { uniq } from 'lodash'
import { Repository } from 'typeorm'
import { ListBuiltinToolsQuery } from '../xpert-toolset'
import { ToolInvokeCommand } from './commands'
import { XpertTool } from './xpert-tool.entity'

@Injectable()
export class XpertToolService extends TenantOrganizationAwareCrudService<XpertTool> {
	readonly #logger = new Logger(XpertToolService.name)

	constructor(
		@InjectRepository(XpertTool)
		repository: Repository<XpertTool>,
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {
		super(repository)
	}

	async getTool(id: string, options?: Partial<PaginationParams<XpertTool>>) {
		let { relations } = options ?? {}
		relations ??= []
		relations.push('toolset')

		const tool = await this.findOne(id, { relations: uniq(relations) })

		if (tool.toolset.category === XpertToolsetCategoryEnum.BUILTIN) {
			const toolDetails = await this.queryBus.execute<ListBuiltinToolsQuery, IBuiltinTool[]>(
				new ListBuiltinToolsQuery(tool.toolset.type, [tool.name])
			)
			tool.provider = toolDetails[0]
		}

		return tool
	}

	async testTool(id: string, tool: Partial<IXpertTool>) {
		const toolDetail = await this.findOne(id, { relations: ['toolset'] })

		return await this.commandBus.execute(
			new ToolInvokeCommand({
				...toolDetail,
				...omit(tool, 'toolset')
			})
		)
	}
}
