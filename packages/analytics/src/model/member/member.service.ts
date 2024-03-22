import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { TenantOrganizationAwareCrudService } from '@metad/server-core'
import { DeepPartial, FindManyOptions, In, Repository } from 'typeorm'
import { SemanticModelMember } from './member.entity'

@Injectable()
export class SemanticModelMemberService extends TenantOrganizationAwareCrudService<SemanticModelMember> {
	constructor(
		@InjectRepository(SemanticModelMember)
		modelCacheRepository: Repository<SemanticModelMember>,
	) {
		super(modelCacheRepository)
	}

	async bulkCreate(members: DeepPartial<SemanticModelMember[]>) {
		return await Promise.all(
			members.map((member) => {
				return this.create(member)
			})
		)
	}

	async bulkDelete(query: FindManyOptions<SemanticModelMember>) {
		const {items: members} = await this.findAll(query)
		return await this.delete({ id: In(members.map((item) => item.id)) })
	}
}
