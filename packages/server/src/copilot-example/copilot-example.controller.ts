import { ICopilotRole, IPagination } from '@metad/contracts'
import { Body, Controller, Get, HttpStatus, Logger, Post, Query, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CrudController, PaginationParams, TransformInterceptor } from '../core'
import { ParseJsonPipe, UseValidationPipe } from '../shared/pipes'
import { CopilotExample } from './copilot-example.entity'
import { CopilotExampleService } from './copilot-example.service'

@ApiTags('CopilotExample')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
@Controller()
export class CopilotExampleController extends CrudController<CopilotExample> {
	readonly #logger = new Logger(CopilotExampleController.name)
	constructor(
		private readonly service: CopilotExampleService,
		private readonly commandBus: CommandBus
	) {
		super(service)
	}

	/**
	 * GET copilot examples
	 *
	 * @param params
	 * @returns
	 */
	@ApiOperation({
		summary: 'Find all copilot examples.'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Found copilot examples',
		type: CopilotExample
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get()
	@UseValidationPipe()
	async getAll(
		@Query('$fitler', ParseJsonPipe) where: PaginationParams<CopilotExample>['where'],
		@Query('$relations', ParseJsonPipe) relations: PaginationParams<CopilotExample>['relations']
	): Promise<IPagination<CopilotExample>> {
		return await this.service.findAll({ where, relations })
	}

	@Post('similarity-search')
	async similaritySearch(
		@Body('query') query: string,
		@Body('options') options?: { k: number; filter: any; score?: number; command: string }
	) {
		this.#logger.debug(
			`[CopilotExampleController] Retrieving documents for query: ${query} with k = ${options?.k} and filter = ${options?.filter}`
		)

		return this.service.similaritySearch(query, options)
	}

	@Post('mmr-search')
	async maxMarginalRelevanceSearch(
		@Body('query') query: string,
		@Body('options') options?: { k: number; filter: any }
	) {
		this.#logger.debug(
			`[CopilotExampleController] Retrieving documents for mmr query: ${query} with k = ${options?.k} and filter = ${options?.filter}`
		)

		return this.service.maxMarginalRelevanceSearch(query, options)
	}

	@Get('commands')
	async getCommands(@Query('$fitler', ParseJsonPipe) where: PaginationParams<CopilotExample>['where']) {
		return this.service.getCommands({ where })
	}

	@Post('bulk')
	async createBulk(
		@Body('examples') entities: CopilotExample[],
		@Body('roles') roles: ICopilotRole[],
		@Body('options') options: { createRole: boolean; clearRole: boolean }
	) {
		return this.service.createBulk(entities, roles, options)
	}
}
