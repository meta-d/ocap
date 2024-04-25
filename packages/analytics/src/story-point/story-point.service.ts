import { RequestContext, TenantOrganizationAwareCrudService } from '@metad/server-core'
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOneOptions, Repository } from 'typeorm'
import { BusinessArea, BusinessAreaService } from '../business-area/index'
import { StoryPointPublicDTO } from './dto'
import { StoryPoint } from './story-point.entity'
import { Visibility } from '@metad/contracts'

@Injectable()
export class StoryPointService extends TenantOrganizationAwareCrudService<StoryPoint> {
	constructor(
		@InjectRepository(StoryPoint)
		pointRepository: Repository<StoryPoint>,
		private businessAreaService: BusinessAreaService
	) {
		super(pointRepository)
	}

	async findPublicOne(id: string, options: FindOneOptions) {
		const point = await this.repository.findOne({
			where: {
				id,
				story: {
					visibility: Visibility.Public
				}
			 },
			 // @todo
			relations: ['story', ...(options?.relations as string[] ?? [])],
		})

		if (!point) {
			throw new NotFoundException()
		}

		return new StoryPointPublicDTO(point)
	}

	protected async checkUpdateAuthorization(id: string) {
		const userId = RequestContext.currentUserId()
		const storyPoint = await this.findOne(id, { relations: ['story', 'story.businessArea'] })

		if (storyPoint?.story?.businessArea) {
			const businessAreaUser = await this.businessAreaService.getAccess(storyPoint.story.businessArea as BusinessArea)
			if (businessAreaUser?.role > 1) {
				throw new UnauthorizedException('Access reject')
			}
		} else if (storyPoint.createdById !== userId) {
			throw new UnauthorizedException('Not yours')
		}

	}
}
