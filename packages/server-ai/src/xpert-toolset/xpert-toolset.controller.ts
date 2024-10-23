import { IPagination, IXpertTool } from '@metad/contracts'
import { CrudController, PaginationParams, ParseJsonPipe, RequestContext, TransformInterceptor } from '@metad/server-core'
import { Body, Controller, Get, HttpStatus, Logger, Param, Post, Query, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ToolsetPublicDTO } from './dto'
import { XpertToolset } from './xpert-toolset.entity'
import { XpertToolsetService } from './xpert-toolset.service'
import { ParserOpenAPISchemaCommand } from './commands/'
import { TestOpenAPICommand } from '../xpert-tool/commands/'
import { TestToolDTO } from '../xpert-tool/dto/'

@ApiTags('XpertToolset')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class XpertToolsetController extends CrudController<XpertToolset> {
	readonly #logger = new Logger(XpertToolsetController.name)
	constructor(
		private readonly service: XpertToolsetService,
		private readonly commandBus: CommandBus
	) {
		super(service)
	}

	@Get('by-workspace/:id')
	async getAllByWorkspace(
		@Param('id') workspaceId: string,
		@Query('data', ParseJsonPipe) data: PaginationParams<XpertToolset>,
		@Query('published') published?: boolean
	) {
		const result = await this.service.getAllByWorkspace(workspaceId, data, published, RequestContext.currentUser())
		return {
			...result,
			items: result.items //.map((item) => new XpertPublicDTO(item))
		}
	}

	@ApiOperation({ summary: 'find all' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found records'
	})
	@Get()
	async findAll(
		@Query('data', ParseJsonPipe) options?: PaginationParams<XpertToolset>
	): Promise<IPagination<XpertToolset>> {
		const { items, ...rest } = await this.service.findAll(options)
		return {
			items: items.map((item) => new ToolsetPublicDTO(item)),
			...rest
		}
	}

	@Post('/tool-provider/openapi/schema')
	async parseOpenAPISchema(@Body() {schema}: {schema: string}) {
		return this.commandBus.execute(new ParserOpenAPISchemaCommand(schema))
	}

	@Post('/tool-provider/openapi/test')
	async testOpenAPI(@Body() tool: IXpertTool) {
		return this.commandBus.execute(new TestOpenAPICommand(tool))
	}
}
