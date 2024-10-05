import { IPagination } from '@metad/contracts'
import { CrudController, PaginationParams, ParseJsonPipe, TransformInterceptor } from '@metad/server-core'
import { Controller, Get, HttpStatus, Logger, Query, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ToolsetPublicDTO } from './dto'
import { XpertToolset } from './xpert-toolset.entity'
import { XpertToolsetService } from './xpert-toolset.service'

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
}
