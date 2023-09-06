import { IQuery } from '@nestjs/cqrs'
import { FindManyOptions } from 'typeorm'
import { Project } from '../project.entity'

/**
 * 查询我有权限的项目列表
 */
export class ProjectMyQuery implements IQuery {
	static readonly type = '[Project] My'

	constructor(public readonly input: Pick<FindManyOptions<Project>, 'relations'> & Pick<FindManyOptions<Project>, 'where'>) {}
}
