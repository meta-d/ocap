import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { BusinessAreaAwareCrudService } from '../core/crud/index'
import { IndicatorCreateCommand } from './commands'
import { IndicatorPublicDTO } from './dto'
import { Indicator } from './indicator.entity'

@Injectable()
export class IndicatorService extends BusinessAreaAwareCrudService<Indicator> {
	constructor(
		@InjectRepository(Indicator)
		indicatorRepository: Repository<Indicator>,
		readonly commandBus: CommandBus
	) {
		super(indicatorRepository, commandBus)
	}

	public async search(text: string) {
		let where = null
		if (text) {
			text = `%${text}%`
			where = [
				{
					code: ILike(text)
				},
				{
					name: ILike(text)
				},
				{
					business: ILike(text)
				}
			]
		}
		const condition = await this.myBusinessAreaConditions({
			where,
			order: {
				updatedAt: 'DESC'
			},
			take: 20
		})

		const [items, total] = await this.repository.findAndCount(condition)

		return {
			total,
			items: items.map((item) => new IndicatorPublicDTO(item))
		}
	}

	async createBulk(indicators: Indicator[]) {
		const results = []
		for await (const indicator of indicators) {
			results.push(await this.commandBus.execute(new IndicatorCreateCommand(indicator)))
		}
		return results
	}
}
