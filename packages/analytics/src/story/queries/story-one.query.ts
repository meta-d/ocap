import { IStory } from '@metad/contracts'
import { IQuery } from '@nestjs/cqrs'
import { FindManyOptions } from 'typeorm'

export class StoryOneQuery implements IQuery {
	static readonly type = '[Story] Query One'

	constructor(public id: string, public options?: Pick<FindManyOptions<IStory>, 'relations'>) {}
}
