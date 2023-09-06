import { IQuery } from '@nestjs/cqrs'
import { FindManyOptions } from 'typeorm'
import { Project } from '../project.entity'

/**
 * 获取单个项目，会检查我的权限
 */
export class ProjectGetQuery implements IQuery {
	static readonly type = '[Project] Get'

	constructor(public readonly input: {
		id: string
		options?: Pick<FindManyOptions<Project>, 'relations'> & Pick<FindManyOptions<Project>, 'where'>
	}) {}
}
