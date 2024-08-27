import { SerializerProtocol } from '@langchain/langgraph-checkpoint'
import { JsonPlusSerializer } from '../serde/jsonplus'
import { ICopilotCheckpointWrites } from '@metad/contracts'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RequestContext } from '../../core'
import { TenantOrganizationAwareCrudService } from '../../core/crud'
import { CopilotCheckpointWrites } from './writes.entity'

@Injectable()
export class CopilotCheckpointWritesService extends TenantOrganizationAwareCrudService<CopilotCheckpointWrites> {
	serde: SerializerProtocol = new JsonPlusSerializer()

	constructor(
		@InjectRepository(CopilotCheckpointWrites)
		repository: Repository<CopilotCheckpointWrites>
	) {
		super(repository)
	}

	async upsert(entities: Partial<ICopilotCheckpointWrites>[]) {
		await this.repository.manager.transaction(async (transactionalEntityManager) => {
			let idx = 0
			for await (const entity of entities) {
				const [type, serializedWrite] = this.serde.dumpsTyped(entity.value)
				await transactionalEntityManager.upsert(
					CopilotCheckpointWrites,
					{
						...entity,
						idx,
						type,
						value: serializedWrite,
						tenantId: RequestContext.currentTenantId(),
						organizationId: RequestContext.getOrganizationId()
					},
					{
						conflictPaths: [
							'organizationId',
							'thread_id',
							'checkpoint_ns',
							'checkpoint_id',
							'task_id',
							'idx'
						]
					}
				)
				idx++
			}
		})
	}

	async deleteByThreadId(threadId: string): Promise<void> {
		await this.delete({ thread_id: threadId })
	}
}
