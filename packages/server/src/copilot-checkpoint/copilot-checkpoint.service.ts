import { ICopilotCheckpoint } from '@metad/contracts'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, Repository } from 'typeorm'
import { TenantOrganizationAwareCrudService } from '../core/crud'
import { CopilotCheckpoint } from './copilot-checkpoint.entity'

@Injectable()
export class CopilotCheckpointService extends TenantOrganizationAwareCrudService<CopilotCheckpoint> {
	constructor(
		@InjectRepository(CopilotCheckpoint)
		repository: Repository<CopilotCheckpoint>
	) {
		super(repository)
	}

	async upsert(entity: DeepPartial<ICopilotCheckpoint>) {
		const { success, record } = await this.findOneOrFail({
			where: {
				thread_id: entity?.thread_id,
				checkpoint_id: entity?.checkpoint_id
			}
		})
		if (success) {
			record.parent_id = entity?.parent_id
			record.checkpoint = entity?.checkpoint
			record.metadata = entity?.metadata
			return await this.repository.save(record)
		} else {
			return await this.create({ ...entity })
		}
	}

	async deleteByThreadId(threadId: string): Promise<void> {
		await this.delete({ thread_id: threadId })
	}
}
