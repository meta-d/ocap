import { IPagination, IStoryPoint } from '@metad/contracts'
import { CrudController, ParseJsonPipe, Public, UUIDValidationPipe } from '@metad/server-core'
import {
	ClassSerializerInterceptor,
	Controller,
	Get,
	NotFoundException,
	Param,
	Query,
	UseInterceptors
} from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { FindOneOptions } from 'typeorm'
import { StoryPointPublicDTO } from './dto'
import { StoryPointOneQuery } from './queries'
import { StoryPoint } from './story-point.entity'
import { StoryPointService } from './story-point.service'

@Controller()
export class StoryPointController extends CrudController<StoryPoint> {
	constructor(private readonly storyPointService: StoryPointService, private readonly queryBus: QueryBus,) {
		super(storyPointService)
	}

	@Get()
	async findAll(@Query('$query', ParseJsonPipe) data: any): Promise<IPagination<StoryPoint>> {
		const { relations, findInput } = data
		return await this.storyPointService.findAll({
			where: findInput,
			relations
		})
	}

	/**
	 * Get public story point
	 *
	 * @param id
	 * @param options
	 * @returns
	 */
	@Public()
	@UseInterceptors(ClassSerializerInterceptor)
	@Get('public/:id')
	async getPublicOne(
		@Param('id', UUIDValidationPipe) id: string,
		@Query('$query', ParseJsonPipe) options: FindOneOptions<IStoryPoint>
	): Promise<StoryPointPublicDTO> {

		const { relations } = options
		const point = await this.storyPointService.findPublicOne(id, { relations })

		if (!point) {
			throw new NotFoundException()
		}

		return point
	}

	@Get(':id')
	async findById(
		@Param('id', UUIDValidationPipe) id: string,
		@Query('$query', ParseJsonPipe) options: FindOneOptions<IStoryPoint>
	): Promise<StoryPoint> {
		return await this.queryBus.execute(new StoryPointOneQuery(id, options))
	}
}
