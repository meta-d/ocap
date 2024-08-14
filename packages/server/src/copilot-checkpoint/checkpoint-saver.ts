import { RunnableConfig } from '@langchain/core/runnables'
import { BaseCheckpointSaver } from '@langchain/langgraph'
import { Checkpoint, CheckpointMetadata, CheckpointTuple } from '@langchain/langgraph/dist/checkpoint/base'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CopilotCheckpoint } from './copilot-checkpoint.entity'

@Injectable()
export class CopilotCheckpointSaver extends BaseCheckpointSaver {
	constructor(
		@InjectRepository(CopilotCheckpoint)
		private repository: Repository<CopilotCheckpoint>
	) {
		super()
	}

	async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
		const { thread_id, checkpoint_id } = config.configurable || {}
		if (checkpoint_id) {
			const items = await this.repository.find({
				where: {
					thread_id,
					checkpoint_id
				}
			})
			const row = items[0]
			if (row) {
				return {
					config,
					checkpoint: (await this.serde.parse(row.checkpoint)) as Checkpoint,
					metadata: (await this.serde.parse(row.metadata)) as CheckpointMetadata,
					parentConfig: row.parent_id
						? {
								configurable: {
									thread_id,
									checkpoint_id: row.parent_id
								}
							}
						: undefined
				}
			}
		} else {
			const items = await this.repository.find({
				where: {
					thread_id
				},
				order: {
					checkpoint_id: 'DESC'
				},
				take: 1
			})

			const row = items[0]
			if (row) {
				return {
					config: {
						configurable: {
							thread_id: row.thread_id,
							checkpoint_id: row.checkpoint_id
						}
					},
					checkpoint: (await this.serde.parse(row.checkpoint)) as Checkpoint,
					metadata: (await this.serde.parse(row.metadata)) as CheckpointMetadata,
					parentConfig: row.parent_id
						? {
								configurable: {
									thread_id: row.thread_id,
									checkpoint_id: row.parent_id
								}
							}
						: undefined
				}
			}
		}

		return undefined
	}

	async *list(config: RunnableConfig, limit?: number, before?: RunnableConfig): AsyncGenerator<CheckpointTuple> {
		console.log(`list checkpoints:`, config, limit, before)
		yield
	}

	async put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata): Promise<RunnableConfig> {
		await this.repository.save({
			thread_id: config.configurable?.thread_id,
			checkpoint_id: checkpoint.id,
			parent_id: config.configurable?.checkpoint_id,
			checkpoint: this.serde.stringify(checkpoint),
			metadata: this.serde.stringify(metadata)
		})

		return {
			configurable: {
				thread_id: config.configurable?.thread_id,
				checkpoint_id: checkpoint.id
			}
		}
	}
}
