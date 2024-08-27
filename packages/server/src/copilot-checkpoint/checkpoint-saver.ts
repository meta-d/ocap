import { RunnableConfig } from '@langchain/core/runnables'
import {
	BaseCheckpointSaver,
	type Checkpoint,
	type CheckpointListOptions,
	type CheckpointMetadata,
	type CheckpointTuple,
	type PendingWrite
} from '@langchain/langgraph-checkpoint'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CopilotCheckpointWrites } from '../core'
import { CopilotCheckpoint } from './copilot-checkpoint.entity'

@Injectable()
export class CopilotCheckpointSaver extends BaseCheckpointSaver {
	constructor(
		@InjectRepository(CopilotCheckpoint)
		private repository: Repository<CopilotCheckpoint>,
		@InjectRepository(CopilotCheckpointWrites)
		private wRepository: Repository<CopilotCheckpointWrites>
	) {
		super()
	}

	async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
		const { thread_id, checkpoint_ns = '', checkpoint_id } = config.configurable || {}
		let row = null
		if (checkpoint_id) {
			const items = await this.repository.find({
				where: {
					thread_id,
					checkpoint_ns,
					checkpoint_id
				}
			})
			row = items[0]
		} else {
			const items = await this.repository.find({
				where: {
					thread_id,
					checkpoint_ns
				},
				order: {
					checkpoint_id: 'DESC'
				},
				take: 1
			})

			row = items[0]
		}

		if (!row) {
			return undefined
		}

		let finalConfig = config
		if (!checkpoint_id) {
			finalConfig = {
				configurable: {
					thread_id: row.thread_id,
					checkpoint_ns,
					checkpoint_id: row.checkpoint_id
				}
			}
		}
		if (
			finalConfig.configurable?.thread_id === undefined ||
			finalConfig.configurable?.checkpoint_id === undefined
		) {
			throw new Error('Missing thread_id or checkpoint_id')
		}

		// find any pending writes
		const pendingWritesRows = await this.wRepository.find({
			where: {
				thread_id: finalConfig.configurable.thread_id.toString(),
				checkpoint_ns,
				checkpoint_id: finalConfig.configurable.checkpoint_id.toString()
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

		return {
			config,
			checkpoint: (await this.serde.loadsTyped(row.type ?? 'json', row.checkpoint)) as Checkpoint,
			metadata: (await this.serde.loadsTyped(row.type ?? 'json', row.metadata)) as CheckpointMetadata,
			parentConfig: row.parent_id
				? {
						configurable: {
							thread_id,
							checkpoint_ns,
							checkpoint_id: row.parent_id
						}
					}
				: undefined,
			pendingWrites
		}
	}

	async *list(config: RunnableConfig, options?: CheckpointListOptions): AsyncGenerator<CheckpointTuple> {
		console.log(`list checkpoints:`, config, options)
		yield
	}

	async put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata): Promise<RunnableConfig> {
		const { tenantId, organizationId } = config.configurable ?? {}
		const [type1, serializedCheckpoint] = this.serde.dumpsTyped(checkpoint)
		const [type2, serializedMetadata] = this.serde.dumpsTyped(metadata)

		if (type1 !== type2) {
			throw new Error('Failed to serialized checkpoint and metadata to the same type.')
		}

		await this.repository.upsert({
			tenantId,
			organizationId,
			thread_id: config.configurable?.thread_id?.toString(),
			checkpoint_ns: config.configurable?.checkpoint_ns,
			checkpoint_id: checkpoint.id,
			parent_id: config.configurable?.checkpoint_id,
			type: type1,
			checkpoint: serializedCheckpoint,
			metadata: serializedMetadata
		} as CopilotCheckpoint, {
			conflictPaths: ['organizationId', 'thread_id', 'checkpoint_ns', 'checkpoint_id']
		})

		return {
			configurable: {
				thread_id: config.configurable?.thread_id,
				checkpoint_ns: config.configurable?.checkpoint_ns,
				checkpoint_id: checkpoint.id
			}
		}
	}

	async putWrites(config: RunnableConfig, writes: PendingWrite[], taskId: string): Promise<void> {
		const { tenantId, organizationId } = config.configurable ?? {}

		await this.wRepository.manager.transaction(async (transactionalEntityManager) => {
			let idx = 0
			for await (const write of writes) {
				const [type, serializedWrite] = this.serde.dumpsTyped(write[1])
				await transactionalEntityManager.upsert(
					CopilotCheckpointWrites,
					{
						tenantId,
						organizationId,
						thread_id: config.configurable?.thread_id,
						checkpoint_ns: config.configurable?.checkpoint_ns,
						checkpoint_id: config.configurable?.checkpoint_id,
						task_id: taskId,
						idx,
						channel: write[0],
						type,
						value: serializedWrite
					},
					{
						conflictPaths: ['organizationId', 'thread_id', 'checkpoint_ns', 'checkpoint_id', 'task_id', 'idx'],
						skipUpdateIfNoValuesChanged: true
					}
				)

				idx++
			}
		})
	}
}
