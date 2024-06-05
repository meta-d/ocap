import { Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Job } from 'bull'
import { SemanticModelMemberService } from '../model-member/member.service'
import { ModelEntityUpdateCommand } from './commands'
import { SemanticModelEntityService } from './entity.service'

@Processor('entity')
export class EntityMemberProcessor {
	private readonly logger = new Logger(EntityMemberProcessor.name)

	constructor(
		private readonly entityService: SemanticModelEntityService,
		private readonly memberService: SemanticModelMemberService,
		private readonly commandBus: CommandBus
	) {}

	@Process('syncMembers')
	async handleSyncMembers(
		job: Job<{
			modelId: string
			organizationId: string
			entityId: string
			cube: string
			hierarchies: string[]
		}>
	) {
		const { modelId, entityId, cube, hierarchies } = job.data
		this.logger.debug(
			`[Job: entity '${job.id}'] Start sync dimension memebrs for model '${modelId}' and cube '${cube}' ...`
		)

		try {
			const cubeMembers = await this.memberService.syncMembers(modelId, {
				[cube]: {
					entityId,
					hierarchies
				}
			})

			// Update job status and sync status of model entity
			await this.commandBus.execute(
				new ModelEntityUpdateCommand({
					id: entityId,
					options: {
						vector: {
							hierarchies
						},
						members: cubeMembers[cube]
					},
					job: {
						id: job.id,
						status: 'completed'
					}
				})
			)

			this.logger.debug(`[Job: entity '${job.id}'] End!`)
		} catch (err) {
			this.entityService.update(entityId, {
				job: {
					id: job.id,
					status: 'failed',
					error: err.message
				}
			})
			await job.moveToFailed(err)
			this.logger.debug(`[Job: entity '${job.id}'] Error!`)
		}
	}
}
