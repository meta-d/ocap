import { Checkpoint, CheckpointMetadata, SerializerProtocol } from '@langchain/langgraph-checkpoint'
import { JsonPlusSerializer } from './serde/jsonplus'
import { ICopilotCheckpoint, OrderTypeEnum } from '@metad/contracts'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, Repository } from 'typeorm'
import { RequestContext } from '../core/context'
import { TenantOrganizationAwareCrudService } from '../core/crud'
import { CopilotCheckpoint } from './copilot-checkpoint.entity'
import { CopilotCheckpointWritesService } from './writes/writes.service'

@Injectable()
export class CopilotCheckpointService extends TenantOrganizationAwareCrudService<CopilotCheckpoint> {
	serde: SerializerProtocol = new JsonPlusSerializer()
	constructor(
		@InjectRepository(CopilotCheckpoint)
		repository: Repository<CopilotCheckpoint>,

		private readonly writesService: CopilotCheckpointWritesService
	) {
		super(repository)
	}

	async getTuple(options: Partial<ICopilotCheckpoint>) {
		const { thread_id, checkpoint_ns, checkpoint_id } = options
		let row = null
		if (checkpoint_id) {
			row = await this.repository.findOne({
				where: {
					thread_id,
					checkpoint_ns,
					checkpoint_id
				}
			})
		} else {
			const rows = await this.repository.find({
				where: {
					thread_id,
					checkpoint_ns
				},
				order: {
					checkpoint_id: OrderTypeEnum.DESC
				},
				take: 1
			})
			row = rows[0]
		}

		if (!row) {
			return null
		}

		// find any pending writes
		const { items: pendingWritesRows } = await this.writesService.findAll({
			where: {
				thread_id,
				checkpoint_ns,
				checkpoint_id
			}
		})
		const pendingWrites = await Promise.all(
			pendingWritesRows.map(async (row) => {
				return [row.task_id, row.channel, await this.serde.loadsTyped(row.type ?? 'json', row.value ?? '')] as [
					string,
					string,
					unknown
				]
			})
		)

		if (row) {
			return {
				config: {
					configurable: {
						thread_id: row.thread_id,
						checkpoint_ns: row.checkpoint_ns,
						checkpoint_id: row.checkpoint_id
					}
				},
				checkpoint: (await this.serde.loadsTyped(
					row.type ?? "json",
					row.checkpoint
				  )) as Checkpoint,
							metadata: (await this.serde.loadsTyped(
					row.type ?? "json",
					row.metadata
				  )) as CheckpointMetadata,
				parentConfig: row.parent_id
					? {
							configurable: {
								thread_id: row.thread_id,
								checkpoint_id: row.parent_id
							}
						}
					: undefined,
				pendingWrites
			}
		}
	}

	async upsert(entity: DeepPartial<ICopilotCheckpoint>) {
		const { checkpoint, metadata } = entity

		const [type1, serializedCheckpoint] = this.serde.dumpsTyped(checkpoint)
		const [type2, serializedMetadata] = this.serde.dumpsTyped(metadata)

		const result = await this.repository.upsert(
			{
				...entity,
				type: type1,
				checkpoint: serializedCheckpoint,
				metadata: serializedMetadata,
				tenantId: RequestContext.currentTenantId(),
				organizationId: RequestContext.getOrganizationId()
			},
			{
				conflictPaths: ['organizationId', 'thread_id', 'checkpoint_ns', 'checkpoint_id']
			}
		)
		const entities = await this.repository.findByIds(result.identifiers.map((o) => o.id))

		return entities[0]
	}

	async deleteByThreadId(threadId: string): Promise<void> {
		await this.delete({ thread_id: threadId })
	}
}
